import express from 'express';
import { getMyCertificates, downloadCertificate } from '../controllers/certificateController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

/**
 * @swagger
 * /api/v1/certificates:
 *   get:
 *     summary: دریافت لیست گواهینامه‌های کاربر
 *     tags: [Certificates]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: لیست گواهینامه‌ها
 */
router.get('/', getMyCertificates);

/**
 * @swagger
 * /api/v1/certificates/{id}/download:
 *   get:
 *     summary: دانلود گواهینامه PDF
 *     tags: [Certificates]
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
 *         description: فایل PDF گواهینامه
 */
router.get('/:id/download', downloadCertificate);

export default router;

