import express from 'express';
import { getCourses, getCourseBySlug, enrollCourse } from '../controllers/courseController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/courses:
 *   get:
 *     summary: دریافت لیست دوره‌ها
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
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
 *         description: لیست دوره‌ها
 */
router.get('/', getCourses);

/**
 * @swagger
 * /api/v1/courses/{slug}:
 *   get:
 *     summary: دریافت جزئیات یک دوره
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: جزئیات دوره
 */
router.get('/:slug', getCourseBySlug);

/**
 * @swagger
 * /api/v1/courses/{slug}/enroll:
 *   post:
 *     summary: ثبت‌نام در دوره
 *     tags: [Courses]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: لینک پرداخت یا ثبت‌نام موفق
 */
router.post('/:slug/enroll', requireAuth, enrollCourse);

export default router;

