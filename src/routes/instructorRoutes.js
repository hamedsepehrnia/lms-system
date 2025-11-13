import express from 'express';
import {
  requestInstructor,
  getMyInstructorCourses,
  createCourse,
  updateCourse,
  addLesson,
  getSalesReport
} from '../controllers/instructorController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { validateCreateCourse, validateCreateLesson } from '../utils/validation.js';
import { uploadImage, uploadVideo } from '../middleware/multer.js';

const router = express.Router();

router.use(requireAuth);

/**
 * @swagger
 * /api/v1/instructor/request:
 *   post:
 *     summary: درخواست تبدیل به مدرس
 *     tags: [Instructor]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: درخواست ثبت شد
 */
router.post('/request', requestInstructor);

/**
 * @swagger
 * /api/v1/instructor/my-courses:
 *   get:
 *     summary: دریافت دوره‌های مدرس
 *     tags: [Instructor]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: لیست دوره‌ها
 */
router.get('/my-courses', requireRole('INSTRUCTOR', 'ADMIN'), getMyInstructorCourses);

/**
 * @swagger
 * /api/v1/instructor/courses:
 *   post:
 *     summary: ایجاد دوره جدید
 *     tags: [Instructor]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *               - categoryId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: integer
 *               categoryId:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: دوره ایجاد شد
 */
router.post('/courses', requireRole('INSTRUCTOR', 'ADMIN'), uploadImage.single('thumbnail'), validateCreateCourse, createCourse);

/**
 * @swagger
 * /api/v1/instructor/courses/{id}:
 *   patch:
 *     summary: به‌روزرسانی دوره
 *     tags: [Instructor]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: دوره به‌روزرسانی شد
 */
router.patch('/courses/:id', requireRole('INSTRUCTOR', 'ADMIN'), uploadImage.single('thumbnail'), updateCourse);

/**
 * @swagger
 * /api/v1/instructor/courses/{id}/lessons:
 *   post:
 *     summary: افزودن درس به دوره
 *     tags: [Instructor]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - orderIndex
 *               - video
 *             properties:
 *               title:
 *                 type: string
 *               orderIndex:
 *                 type: integer
 *               duration:
 *                 type: integer
 *               isFree:
 *                 type: boolean
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: درس افزوده شد
 */
router.post('/courses/:id/lessons', requireRole('INSTRUCTOR', 'ADMIN'), uploadVideo.single('video'), validateCreateLesson, addLesson);

/**
 * @swagger
 * /api/v1/instructor/sales-report:
 *   get:
 *     summary: گزارش فروش مدرس
 *     tags: [Instructor]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: گزارش فروش
 */
router.get('/sales-report', requireRole('INSTRUCTOR', 'ADMIN'), getSalesReport);

export default router;

