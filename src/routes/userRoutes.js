import express from 'express';
import { getMe, updateMe, getMyCourses } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateUpdateProfile } from '../utils/validation.js';
import { uploadImage } from '../middleware/multer.js';

const router = express.Router();

// تمام routes نیاز به احراز هویت دارند
router.use(requireAuth);

/**
 * @swagger
 * /api/v1/me:
 *   get:
 *     summary: دریافت اطلاعات کاربر جاری
 *     tags: [User]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: اطلاعات کاربر
 */
router.get('/me', getMe);

/**
 * @swagger
 * /api/v1/me:
 *   patch:
 *     summary: به‌روزرسانی پروفایل کاربر
 *     tags: [User]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: پروفایل به‌روزرسانی شد
 */
router.patch('/me', uploadImage.single('avatar'), validateUpdateProfile, updateMe);

/**
 * @swagger
 * /api/v1/my/courses:
 *   get:
 *     summary: دریافت دوره‌های ثبت‌نام شده کاربر
 *     tags: [User]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: لیست دوره‌ها
 */
router.get('/my/courses', getMyCourses);

export default router;

