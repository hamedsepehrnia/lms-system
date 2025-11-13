import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * دریافت اطلاعات کاربر جاری
 */
export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('خطا در دریافت اطلاعات کاربر:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت اطلاعات کاربر'
    });
  }
};

/**
 * به‌روزرسانی پروفایل کاربر
 */
export const updateMe = async (req, res) => {
  try {
    const { name } = req.body;
    let avatarPath = req.user.avatar;

    // اگر فایل آواتار آپلود شده
    if (req.file) {
      // حذف آواتار قبلی در صورت وجود
      if (avatarPath) {
        const oldAvatarPath = path.join(__dirname, '../../', avatarPath);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      avatarPath = `/uploads/avatars/${req.file.filename}`;
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (avatarPath) updateData.avatar = avatarPath;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        avatar: true
      }
    });

    res.json({
      success: true,
      message: 'پروفایل با موفقیت به‌روزرسانی شد',
      data: { user }
    });
  } catch (error) {
    console.error('خطا در به‌روزرسانی پروفایل:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در به‌روزرسانی پروفایل'
    });
  }
};

/**
 * دریافت دوره‌های ثبت‌نام شده کاربر
 */
export const getMyCourses = async (req, res) => {
  try {
    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        userId: req.user.id,
        status: 'COMPLETED'
      },
      include: {
        course: {
          include: {
            category: true,
            instructor: {
              select: {
                id: true,
                name: true,
                phone: true
              }
            },
            lessons: {
              orderBy: {
                orderIndex: 'asc'
              }
            },
            _count: {
              select: {
                enrollments: true
              }
            }
          }
        }
      },
      orderBy: {
        purchasedAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: { courses: enrollments.map(e => e.course) }
    });
  } catch (error) {
    console.error('خطا در دریافت دوره‌های کاربر:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت دوره‌ها'
    });
  }
};

