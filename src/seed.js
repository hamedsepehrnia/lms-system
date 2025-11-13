import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 شروع seed کردن دیتابیس...');

  // ایجاد ادمین
  const adminPhone = '09121234567';
  let admin = await prisma.user.findUnique({
    where: { phone: adminPhone }
  });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        phone: adminPhone,
        name: 'ادمین',
        role: 'ADMIN'
      }
    });
    console.log('✅ ادمین ایجاد شد:', admin.phone);
  } else {
    // به‌روزرسانی نقش به ADMIN در صورت نیاز
    if (admin.role !== 'ADMIN') {
      admin = await prisma.user.update({
        where: { id: admin.id },
        data: { role: 'ADMIN' }
      });
      console.log('✅ نقش ادمین به‌روزرسانی شد');
    } else {
      console.log('ℹ️  ادمین از قبل وجود دارد');
    }
  }

  // ایجاد دسته‌بندی‌ها
  const categories = [
    { title: 'برنامه‌نویسی', slug: 'programming' },
    { title: 'طراحی وب', slug: 'web-design' },
    { title: 'هوش مصنوعی', slug: 'artificial-intelligence' }
  ];

  const createdCategories = [];
  for (const cat of categories) {
    let category = await prisma.category.findUnique({
      where: { slug: cat.slug }
    });

    if (!category) {
      category = await prisma.category.create({
        data: cat
      });
      console.log(`✅ دسته‌بندی ایجاد شد: ${category.title}`);
    } else {
      console.log(`ℹ️  دسته‌بندی از قبل وجود دارد: ${category.title}`);
    }
    createdCategories.push(category);
  }

  // ایجاد یک دوره نمونه
  if (createdCategories.length > 0) {
    const sampleCourse = await prisma.course.findFirst({
      where: {
        title: 'دوره نمونه برنامه‌نویسی'
      }
    });

    if (!sampleCourse) {
      const course = await prisma.course.create({
        data: {
          title: 'دوره نمونه برنامه‌نویسی',
          slug: 'sample-programming-course-' + Date.now(),
          description: 'این یک دوره نمونه برای تست سیستم است',
          price: 100000n, // 100,000 تومان
          categoryId: createdCategories[0].id,
          instructorId: admin.id,
          isPublished: true
        }
      });

      // ایجاد چند درس نمونه
      const lessons = [
        {
          title: 'معرفی دوره',
          orderIndex: 1,
          isFree: true,
          videoUrl: '/uploads/lessons/sample-1.mp4'
        },
        {
          title: 'نصب و راه‌اندازی',
          orderIndex: 2,
          isFree: true,
          videoUrl: '/uploads/lessons/sample-2.mp4',
          duration: 1200 // 20 دقیقه
        },
        {
          title: 'اولین پروژه',
          orderIndex: 3,
          isFree: false,
          videoUrl: '/uploads/lessons/sample-3.mp4',
          duration: 1800 // 30 دقیقه
        }
      ];

      for (const lesson of lessons) {
        await prisma.lesson.create({
          data: {
            ...lesson,
            courseId: course.id
          }
        });
      }

      console.log(`✅ دوره نمونه ایجاد شد: ${course.title}`);
      console.log(`   - ${lessons.length} درس اضافه شد`);
    } else {
      console.log('ℹ️  دوره نمونه از قبل وجود دارد');
    }
  }

  console.log('✨ Seed با موفقیت انجام شد!');
}

main()
  .catch((e) => {
    console.error('❌ خطا در seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

