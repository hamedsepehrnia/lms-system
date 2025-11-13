import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * آمار کلی سیستم
 */
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue,
      pendingInstructorRequests
    ] = await Promise.all([
      prisma.user.count(),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.courseEnrollment.count({ where: { status: 'COMPLETED' } }),
      prisma.transaction.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.instructorRequest.count({ where: { status: 'PENDING' } })
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalCourses,
          totalEnrollments,
          totalRevenue: totalRevenue._sum.amount ? Number(totalRevenue._sum.amount) : 0,
          pendingInstructorRequests
        }
      }
    });
  } catch (error) {
    console.error('خطا در دریافت آمار:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت آمار'
    });
  }
};

/**
 * دریافت لیست درخواست‌های مدرس
 */
export const getInstructorRequests = async (req, res) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }

    const requests = await prisma.instructorRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            name: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: { requests }
    });
  } catch (error) {
    console.error('خطا در دریافت درخواست‌ها:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت درخواست‌ها'
    });
  }
};

/**
 * تایید یا رد درخواست مدرس
 */
export const handleInstructorRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminMessage } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'وضعیت نامعتبر است'
      });
    }

    const request = await prisma.instructorRequest.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'درخواست یافت نشد'
      });
    }

    // به‌روزرسانی درخواست
    await prisma.instructorRequest.update({
      where: { id },
      data: {
        status,
        adminMessage
      }
    });

    // اگر تایید شد، تغییر نقش کاربر
    if (status === 'APPROVED') {
      await prisma.user.update({
        where: { id: request.userId },
        data: {
          role: 'INSTRUCTOR'
        }
      });
    }

    res.json({
      success: true,
      message: status === 'APPROVED' ? 'درخواست تایید شد' : 'درخواست رد شد',
      data: { request }
    });
  } catch (error) {
    console.error('خطا در پردازش درخواست:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در پردازش درخواست'
    });
  }
};

/**
 * انتشار یا عدم انتشار دوره
 */
export const publishCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    const course = await prisma.course.findUnique({
      where: { id }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'دوره یافت نشد'
      });
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: { isPublished: isPublished === true || isPublished === 'true' }
    });

    res.json({
      success: true,
      message: isPublished ? 'دوره منتشر شد' : 'انتشار دوره لغو شد',
      data: { course: updatedCourse }
    });
  } catch (error) {
    console.error('خطا در انتشار دوره:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در انتشار دوره'
    });
  }
};

/**
 * مدیریت دسته‌بندی‌ها - ایجاد
 */
export const createCategory = async (req, res) => {
  try {
    const { title } = req.body;
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

    const category = await prisma.category.create({
      data: {
        title,
        slug
      }
    });

    res.status(201).json({
      success: true,
      message: 'دسته‌بندی با موفقیت ایجاد شد',
      data: { category }
    });
  } catch (error) {
    console.error('خطا در ایجاد دسته‌بندی:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در ایجاد دسته‌بندی'
    });
  }
};

/**
 * مدیریت دسته‌بندی‌ها - به‌روزرسانی
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: { title }
    });

    res.json({
      success: true,
      message: 'دسته‌بندی با موفقیت به‌روزرسانی شد',
      data: { category }
    });
  } catch (error) {
    console.error('خطا در به‌روزرسانی دسته‌بندی:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در به‌روزرسانی دسته‌بندی'
    });
  }
};

/**
 * مدیریت دسته‌بندی‌ها - حذف
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.category.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'دسته‌بندی با موفقیت حذف شد'
    });
  } catch (error) {
    console.error('خطا در حذف دسته‌بندی:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در حذف دسته‌بندی'
    });
  }
};

