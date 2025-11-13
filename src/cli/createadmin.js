import { PrismaClient } from '@prisma/client';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

/**
 * CLI Tool برای ایجاد کاربر ادمین
 * مشابه Django's createsuperuser
 * 
 * استفاده:
 * node src/cli/createadmin.js
 */
class CreateAdminCLI {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * دریافت ورودی از کاربر
   */
  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * اعتبارسنجی شماره تلفن
   */
  validatePhone(phone) {
    const phoneRegex = /^09\d{9}$/;
    if (!phone) {
      return 'شماره تلفن الزامی است';
    }
    if (!phoneRegex.test(phone)) {
      return 'فرمت شماره تلفن صحیح نیست. باید به صورت 09xxxxxxxxx باشد (مثال: 09123456789)';
    }
    return null;
  }

  /**
   * اعتبارسنجی نام
   */
  validateName(name) {
    if (!name) {
      return 'نام الزامی است';
    }
    if (name.length < 2) {
      return 'نام باید حداقل 2 کاراکتر باشد';
    }
    if (name.length > 100) {
      return 'نام نباید بیشتر از 100 کاراکتر باشد';
    }
    return null;
  }

  /**
   * ایجاد کاربر ادمین
   */
  async createAdmin(phone, name) {
    try {
      // بررسی وجود کاربر با این شماره
      const existingUser = await prisma.user.findUnique({
        where: { phone }
      });

      if (existingUser) {
        // اگر کاربر وجود دارد، بررسی نقش
        if (existingUser.role === 'ADMIN') {
          console.log('\n⚠️  کاربر با این شماره تلفن از قبل به عنوان ادمین وجود دارد.');
          const update = await this.question('آیا می‌خواهید نام را به‌روزرسانی کنید؟ (y/n): ');
          
          if (update.toLowerCase() === 'y' || update.toLowerCase() === 'yes') {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { name }
            });
            console.log('✅ نام کاربر به‌روزرسانی شد.');
          }
          return existingUser;
        } else {
          // تبدیل نقش به ADMIN
          const confirm = await this.question(`\n⚠️  کاربر با این شماره وجود دارد اما نقش آن ${existingUser.role} است.\nآیا می‌خواهید نقش را به ADMIN تغییر دهید؟ (y/n): `);
          
          if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
            const updatedUser = await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                role: 'ADMIN',
                name: name || existingUser.name
              }
            });
            console.log('✅ نقش کاربر به ADMIN تغییر یافت.');
            return updatedUser;
          } else {
            console.log('❌ عملیات لغو شد.');
            return null;
          }
        }
      }

      // ایجاد کاربر جدید
      const user = await prisma.user.create({
        data: {
          phone,
          name,
          role: 'ADMIN'
        }
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * اجرای اصلی CLI
   */
  async run() {
    console.log('\n' + '='.repeat(50));
    console.log('🔐 ایجاد کاربر ادمین');
    console.log('='.repeat(50) + '\n');

    try {
      // دریافت شماره تلفن
      let phone = '';
      let phoneError = null;
      
      do {
        phone = await this.question('شماره تلفن (09xxxxxxxxx): ');
        phoneError = this.validatePhone(phone);
        
        if (phoneError) {
          console.log(`❌ ${phoneError}\n`);
        }
      } while (phoneError);

      // دریافت نام
      let name = '';
      let nameError = null;
      
      do {
        name = await this.question('نام: ');
        nameError = this.validateName(name);
        
        if (nameError) {
          console.log(`❌ ${nameError}\n`);
        }
      } while (nameError);

      // نمایش اطلاعات
      console.log('\n' + '-'.repeat(50));
      console.log('📋 اطلاعات کاربر:');
      console.log(`   شماره تلفن: ${phone}`);
      console.log(`   نام: ${name}`);
      console.log(`   نقش: ADMIN`);
      console.log('-'.repeat(50));

      // تایید نهایی
      const confirm = await this.question('\nآیا می‌خواهید این کاربر را ایجاد کنید؟ (y/n): ');
      
      if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
        console.log('\n❌ عملیات لغو شد.');
        this.close();
        return;
      }

      // ایجاد کاربر
      console.log('\n⏳ در حال ایجاد کاربر...');
      const user = await this.createAdmin(phone, name);

      if (user) {
        console.log('\n' + '='.repeat(50));
        console.log('✅ کاربر ادمین با موفقیت ایجاد شد!');
        console.log('='.repeat(50));
        console.log(`\n📱 شماره تلفن: ${user.phone}`);
        console.log(`👤 نام: ${user.name || '(تعریف نشده)'}`);
        console.log(`🔑 نقش: ${user.role}`);
        console.log(`🆔 شناسه: ${user.id}`);
        console.log('\n💡 نکته: حالا می‌توانید با این شماره تلفن و روش OTP عادی وارد سیستم شوید.');
        console.log('   POST /api/v1/auth/send-otp → POST /api/v1/auth/verify-otp\n');
      }

    } catch (error) {
      console.error('\n❌ خطا در ایجاد کاربر ادمین:');
      console.error(error.message);
      
      if (error.code === 'P2002') {
        console.error('\n⚠️  این شماره تلفن از قبل در سیستم ثبت شده است.');
      }
      
      process.exit(1);
    } finally {
      this.close();
    }
  }

  /**
   * بستن readline interface
   */
  close() {
    this.rl.close();
    prisma.$disconnect();
  }
}

// اجرای CLI (اگر فایل به صورت مستقیم اجرا شود)
if (process.argv[1] && process.argv[1].includes('createadmin.js')) {
  const cli = new CreateAdminCLI();
  cli.run().catch((error) => {
    console.error('خطای غیرمنتظره:', error);
    process.exit(1);
  });
}

export default CreateAdminCLI;

