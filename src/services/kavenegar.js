import https from 'https';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ارسال OTP از طریق Kavenegar یا نمایش در ترمینال (Debug Mode)
 */
export const sendOTP = async (phone, code) => {
  // حالت Debug: نمایش کد در ترمینال به جای ارسال پیامک
  const debugMode = process.env.OTP_DEBUG_MODE === 'true' || process.env.OTP_DEBUG_MODE === '1';
  
  if (debugMode) {
    console.log('\n' + '='.repeat(60));
    console.log('📱 DEBUG MODE - OTP Code (پیامک ارسال نشد)');
    console.log('='.repeat(60));
    console.log(`📞 شماره تلفن: ${phone}`);
    console.log(`🔐 کد تایید: ${code}`);
    console.log('⏰ مدت اعتبار: 120 ثانیه');
    console.log('='.repeat(60) + '\n');
    
    // شبیه‌سازی موفقیت ارسال
    return Promise.resolve({
      return: {
        status: 200,
        message: 'OTP displayed in console (Debug Mode)'
      }
    });
  }

  // حالت Production: ارسال واقعی پیامک
  return new Promise((resolve, reject) => {
    const apiKey = process.env.KAVENEGAR_API_KEY;
    const sender = process.env.KAVENEGAR_SENDER || '10008663';
    const message = `کد تایید شما: ${code}\nپایا لایف`;

    const options = {
      hostname: 'api.kavenegar.com',
      path: `/v1/${apiKey}/sms/send.json?receptor=${phone}&sender=${sender}&message=${encodeURIComponent(message)}`,
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.return && result.return.status === 200) {
            resolve(result);
          } else {
            reject(new Error(result.return?.message || 'خطا در ارسال پیامک'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

/**
 * تولید کد OTP 6 رقمی
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * بررسی محدودیت ارسال OTP
 */
export const checkOTPRateLimit = async (phone) => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

  // بررسی ارسال در 60 ثانیه گذشته
  const recentOTP = await prisma.otp.findFirst({
    where: {
      phone,
      createdAt: {
        gte: oneMinuteAgo
      }
    }
  });

  if (recentOTP) {
    throw new Error('لطفاً 60 ثانیه صبر کنید و دوباره تلاش کنید');
  }

  // بررسی تعداد ارسال در یک ساعت گذشته
  const hourlyOTPs = await prisma.otp.count({
    where: {
      phone,
      createdAt: {
        gte: oneHourAgo
      }
    }
  });

  if (hourlyOTPs >= 5) {
    throw new Error('تعداد درخواست‌های شما در یک ساعت گذشته بیش از حد مجاز است. لطفاً یک ساعت دیگر تلاش کنید');
  }

  return true;
};

/**
 * ذخیره OTP در دیتابیس
 */
export const saveOTP = async (phone, code) => {
  const expiresAt = new Date(Date.now() + 120 * 1000); // 120 ثانیه

  await prisma.otp.create({
    data: {
      phone,
      code,
      expiresAt
    }
  });
};

/**
 * بررسی و استفاده از OTP
 */
export const verifyOTP = async (phone, code) => {
  const now = new Date();

  const otp = await prisma.otp.findFirst({
    where: {
      phone,
      code,
      used: false,
      expiresAt: {
        gt: now
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  if (!otp) {
    throw new Error('کد تایید نامعتبر یا منقضی شده است');
  }

  // علامت‌گذاری OTP به عنوان استفاده شده
  await prisma.otp.update({
    where: { id: otp.id },
    data: { used: true }
  });

  return true;
};

