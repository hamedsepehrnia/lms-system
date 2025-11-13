import express from 'express';
import rateLimit from 'express-rate-limit';
import { paymentCallback } from '../controllers/paymentController.js';

const router = express.Router();

// Rate limiting برای callback پرداخت
const paymentRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    message: 'تعداد درخواست‌های شما بیش از حد مجاز است'
  }
});

/**
 * @swagger
 * /api/v1/payment/callback:
 *   get:
 *     summary: Callback پرداخت Zarinpal
 *     tags: [Payment]
 *     parameters:
 *       - in: query
 *         name: Authority
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: Status
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirect به صفحه موفقیت یا خطا
 */
router.get('/callback', paymentRateLimit, paymentCallback);

export default router;

