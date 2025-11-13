import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import slugify from '../utils/slugify.js';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * درخواست تبدیل به مدرس
 */
export const requestInstructor = async (req, res) => {
  try {
    // بررسی درخواست قبلی
    const existingRequest = await prisma.instructorRequest.findFirst({
      where: {
        userId: req.user.id,
        status: 'PENDING'
      }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'شما یک درخواست در حال بررسی دارید'
      });
    }

    // بررسی اینکه قبلاً مدرس نشده باشد
    if (req.user.role === 'INSTRUCTOR' || req.user.role === 'ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'شما قبلاً مدرس هستید'
      });
    }

    const request = await prisma.instructorRequest.create({
      data: {
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      message: 'درخواست شما با موفقیت ثبت شد',
      data: { request }
    });
  } catch (error) {
    console.error('خطا در ثبت درخواست مدرس:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در ثبت درخواست'
    });
  }
};

/**
 * دریافت دوره‌های مدرس
 */
export const getMyInstructorCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: {
        instructorId: req.user.id
      },
      include: {
        category: true,
        _count: {
          select: {
            enrollments: true,
            lessons: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: { courses }
    });
  } catch (error) {
    console.error('خطا در دریافت دوره‌های مدرس:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت دوره‌ها'
    });
  }
};

/**
 * ایجاد دوره جدید
 */
export const createCourse = async (req, res) => {
  try {
    const { title, description, price, categoryId } = req.body;
    let thumbnailPath = null;

    if (req.file) {
      thumbnailPath = `/uploads/courses/${req.file.filename}`;
    }

    const slug = slugify(title) + '-' + Date.now();

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        price: BigInt(price),
        categoryId,
        instructorId: req.user.id,
        thumbnail: thumbnailPath
      },
      include: {
        category: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'دوره با موفقیت ایجاد شد',
      data: { course }
    });
  } catch (error) {
    console.error('خطا در ایجاد دوره:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در ایجاد دوره'
    });
  }
};

/**
 * به‌روزرسانی دوره
 */
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, categoryId, isPublished } = req.body;

    // بررسی مالکیت دوره
    const course = await prisma.course.findUnique({
      where: { id }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'دوره یافت نشد'
      });
    }

    if (course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'شما دسترسی به این دوره را ندارید'
      });
    }

    const updateData = {};
    if (title) {
      updateData.title = title;
      updateData.slug = slugify(title) + '-' + Date.now();
    }
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = BigInt(price);
    if (categoryId) updateData.categoryId = categoryId;
    if (isPublished !== undefined && req.user.role === 'ADMIN') {
      updateData.isPublished = isPublished;
    }

    // آپلود thumbnail جدید
    if (req.file) {
      // حذف thumbnail قبلی
      if (course.thumbnail) {
        const oldThumbnailPath = path.join(__dirname, '../../', course.thumbnail);
        if (fs.existsSync(oldThumbnailPath)) {
          fs.unlinkSync(oldThumbnailPath);
        }
      }
      updateData.thumbnail = `/uploads/courses/${req.file.filename}`;
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        category: true
      }
    });

    res.json({
      success: true,
      message: 'دوره با موفقیت به‌روزرسانی شد',
      data: { course: updatedCourse }
    });
  } catch (error) {
    console.error('خطا در به‌روزرسانی دوره:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در به‌روزرسانی دوره'
    });
  }
};

/**
 * افزودن درس به دوره
 */
export const addLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, orderIndex, duration, isFree } = req.body;

    // بررسی مالکیت دوره
    const course = await prisma.course.findUnique({
      where: { id }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'دوره یافت نشد'
      });
    }

    if (course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'شما دسترسی به این دوره را ندارید'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'فایل ویدیو الزامی است'
      });
    }

    const videoUrl = `/uploads/lessons/${req.file.filename}`;

    const lesson = await prisma.lesson.create({
      data: {
        courseId: id,
        title,
        videoUrl,
        orderIndex: parseInt(orderIndex),
        duration: duration ? parseInt(duration) : null,
        isFree: isFree === true || isFree === 'true'
      }
    });

    res.status(201).json({
      success: true,
      message: 'درس با موفقیت افزوده شد',
      data: { lesson }
    });
  } catch (error) {
    console.error('خطا در افزودن درس:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در افزودن درس'
    });
  }
};

/**
 * گزارش فروش مدرس
 */
export const getSalesReport = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: {
        instructorId: req.user.id
      },
      include: {
        enrollments: {
          where: {
            status: 'COMPLETED'
          }
        }
      }
    });

    const report = courses.map(course => {
      const totalSales = course.enrollments.reduce((sum, e) => sum + Number(e.pricePaid), 0);
      const totalEnrollments = course.enrollments.length;

      return {
        courseId: course.id,
        courseTitle: course.title,
        totalEnrollments,
        totalSales,
        averagePrice: totalEnrollments > 0 ? totalSales / totalEnrollments : 0
      };
    });

    const totalRevenue = report.reduce((sum, r) => sum + r.totalSales, 0);
    const totalEnrollments = report.reduce((sum, r) => sum + r.totalEnrollments, 0);

    res.json({
      success: true,
      data: {
        courses: report,
        summary: {
          totalRevenue,
          totalEnrollments,
          totalCourses: courses.length
        }
      }
    });
  } catch (error) {
    console.error('خطا در دریافت گزارش فروش:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت گزارش'
    });
  }
};

