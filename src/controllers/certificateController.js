import { PrismaClient } from '@prisma/client';
import { generateCertificate } from '../services/pdf.js';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

/**
 * دریافت لیست گواهینامه‌های کاربر
 */
export const getMyCertificates = async (req, res) => {
  try {
    const certificates = await prisma.certificate.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        course: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        issuedAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: { certificates }
    });
  } catch (error) {
    console.error('خطا در دریافت گواهینامه‌ها:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت گواهینامه‌ها'
    });
  }
};

/**
 * دانلود گواهینامه
 */
export const downloadCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        user: true,
        course: true
      }
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'گواهینامه یافت نشد'
      });
    }

    // بررسی دسترسی (فقط صاحب گواهینامه یا ادمین)
    if (certificate.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'شما دسترسی به این گواهینامه را ندارید'
      });
    }

    // تولید PDF
    const filePath = await generateCertificate(id);

    // ارسال فایل
    res.download(filePath, `certificate-${certificate.certificateNumber}.pdf`, (err) => {
      if (err) {
        console.error('خطا در ارسال فایل:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'خطا در ارسال فایل'
          });
        }
      }
    });
  } catch (error) {
    console.error('خطا در دانلود گواهینامه:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطا در دانلود گواهینامه'
    });
  }
};

