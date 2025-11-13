import { PrismaClient } from '@prisma/client';
import { sendOTP, generateOTP, checkOTPRateLimit, saveOTP, verifyOTP } from '../services/kavenegar.js';

const prisma = new PrismaClient();

/**
 * ارسال کد OTP
 */
export const sendOTPCode = async (req, res) => {
  try {
    const { phone } = req.body;

    // بررسی محدودیت ارسال
    await checkOTPRateLimit(phone);

    // تولید و ارسال OTP
    const code = generateOTP();
    await sendOTP(phone, code);
    await saveOTP(phone, code);

    res.json({
      success: true,
      message: 'کد تایید به شماره شما ارسال شد'
    });
  } catch (error) {
    console.error('خطا در ارسال OTP:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'خطا در ارسال کد تایید'
    });
  }
};

/**
 * تایید OTP و ایجاد سشن
 */
export const verifyOTPCode = async (req, res) => {
  try {
    const { phone, code } = req.body;

    // بررسی OTP
    await verifyOTP(phone, code);

    // پیدا کردن یا ایجاد کاربر
    let user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          role: 'STUDENT'
        }
      });
    }

    // ایجاد سشن
    req.session.userId = user.id;
    req.session.role = user.role;

    res.json({
      success: true,
      message: 'ورود با موفقیت انجام شد',
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.error('خطا در تایید OTP:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'خطا در تایید کد'
    });
  }
};

/**
 * خروج از حساب کاربری
 */
export const logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'خطا در خروج از حساب کاربری'
      });
    }
    res.json({
      success: true,
      message: 'با موفقیت خارج شدید'
    });
  });
};

