import express from 'express';
import {
  getDashboardStats,
  getInstructorRequests,
  handleInstructorRequest,
  publishCourse,
  createCategory,
  updateCategory,
  deleteCategory,
  getEnrollments,
  getTransactions
} from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = express.Router();

// تمام routes نیاز به نقش ADMIN دارند
router.use(requireAuth);
router.use(requireRole('ADMIN'));

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     summary: آمار کلی سیستم
 *     tags: [Admin]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: آمار سیستم
 */
router.get('/dashboard', getDashboardStats);

/**
 * @swagger
 * /api/v1/admin/instructor-requests:
 *   get:
 *     summary: دریافت لیست درخواست‌های مدرس
 *     tags: [Admin]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: لیست درخواست‌ها
 */
router.get('/instructor-requests', getInstructorRequests);

/**
 * @swagger
 * /api/v1/admin/instructor-requests/{id}:
 *   patch:
 *     summary: تایید یا رد درخواست مدرس
 *     tags: [Admin]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *               adminMessage:
 *                 type: string
 *     responses:
 *       200:
 *         description: درخواست پردازش شد
 */
router.patch('/instructor-requests/:id', handleInstructorRequest);

/**
 * @swagger
 * /api/v1/admin/courses/{id}/publish:
 *   patch:
 *     summary: انتشار یا عدم انتشار دوره
 *     tags: [Admin]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isPublished
 *             properties:
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: وضعیت انتشار به‌روزرسانی شد
 */
router.patch('/courses/:id/publish', publishCourse);

/**
 * @swagger
 * /api/v1/admin/categories:
 *   post:
 *     summary: ایجاد دسته‌بندی جدید
 *     tags: [Admin]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: دسته‌بندی ایجاد شد
 */
router.post('/categories', createCategory);

/**
 * @swagger
 * /api/v1/admin/categories/{id}:
 *   patch:
 *     summary: به‌روزرسانی دسته‌بندی
 *     tags: [Admin]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: دسته‌بندی به‌روزرسانی شد
 */
router.patch('/categories/:id', updateCategory);

/**
 * @swagger
 * /api/v1/admin/categories/{id}:
 *   delete:
 *     summary: حذف دسته‌بندی
 *     tags: [Admin]
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
 *         description: دسته‌بندی حذف شد
 */
router.delete('/categories/:id', deleteCategory);

/**
 * @swagger
 * /api/v1/admin/enrollments:
 *   get:
 *     summary: دریافت لیست ثبت‌نام‌ها (سفارش‌ها)
 *     tags: [Admin]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: لیست ثبت‌نام‌ها
 */
router.get('/enrollments', getEnrollments);

/**
 * @swagger
 * /api/v1/admin/transactions:
 *   get:
 *     summary: دریافت لیست تراکنش‌ها
 *     tags: [Admin]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: لیست تراکنش‌ها
 */
router.get('/transactions', getTransactions);

export default router;

