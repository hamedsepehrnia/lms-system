import express from 'express';
import { updateProgress } from '../controllers/progressController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateProgress } from '../utils/validation.js';

const router = express.Router();

router.use(requireAuth);

/**
 * @swagger
 * /api/v1/progress:
 *   post:
 *     summary: ثبت یا به‌روزرسانی پیشرفت کاربر
 *     tags: [Progress]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lessonId
 *               - isCompleted
 *             properties:
 *               lessonId:
 *                 type: string
 *               isCompleted:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: پیشرفت ثبت شد
 */
router.post('/', validateProgress, updateProgress);

export default router;

