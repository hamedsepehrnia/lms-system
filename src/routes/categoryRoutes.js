import express from 'express';
import { getCategories } from '../controllers/categoryController.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: دریافت لیست دسته‌بندی‌ها
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: لیست دسته‌بندی‌ها
 */
router.get('/', getCategories);

export default router;

