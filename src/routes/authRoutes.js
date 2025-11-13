import express from 'express';
import rateLimit from 'express-rate-limit';
import { sendOTPCode, verifyOTPCode, logout } from '../controllers/authController.js';
import { validateSendOTP, validateVerifyOTP } from '../utils/validation.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Rate limiting برای OTP
const otpRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  message: {
    success: false,
    message: 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً یک ساعت دیگر تلاش کنید'
  }
});

/**
 * @swagger
 * /api/v1/auth/send-otp:
 *   post:
 *     summary: ارسال کد تایید OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "09123456789"
 *     responses:
 *       200:
 *         description: کد تایید ارسال شد
 */
router.post('/send-otp', otpRateLimit, validateSendOTP, sendOTPCode);

/**
 * @swagger
 * /api/v1/auth/verify-otp:
 *   post:
 *     summary: تایید کد OTP و ورود
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - code
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "09123456789"
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: ورود موفق
 */
router.post('/verify-otp', validateVerifyOTP, verifyOTPCode);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: خروج از حساب کاربری
 *     tags: [Authentication]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: خروج موفق
 */
router.post('/logout', requireAuth, logout);

export default router;

