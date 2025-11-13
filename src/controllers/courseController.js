import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * دریافت لیست دوره‌ها (عمومی)
 */
export const getCourses = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      isPublished: true
    };

    if (category) {
      where.categoryId = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          category: true,
          instructor: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              enrollments: true,
              lessons: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.course.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('خطا در دریافت دوره‌ها:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت دوره‌ها'
    });
  }
};

/**
 * دریافت جزئیات یک دوره
 */
export const getCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true
          }
        },
        lessons: {
          orderBy: {
            orderIndex: 'asc'
          },
          select: {
            id: true,
            title: true,
            duration: true,
            orderIndex: true,
            isFree: true
          }
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'دوره یافت نشد'
      });
    }

    // اگر دوره منتشر نشده و کاربر سازنده یا ادمین نیست
    if (!course.isPublished && (!req.user || (req.user.id !== course.instructorId && req.user.role !== 'ADMIN'))) {
      return res.status(404).json({
        success: false,
        message: 'دوره یافت نشد'
      });
    }

    // بررسی ثبت‌نام کاربر (اگر لاگین باشد)
    let isEnrolled = false;
    if (req.user) {
      const enrollment = await prisma.courseEnrollment.findFirst({
        where: {
          userId: req.user.id,
          courseId: course.id,
          status: 'COMPLETED'
        }
      });
      isEnrolled = !!enrollment;
    }

    res.json({
      success: true,
      data: {
        course: {
          ...course,
          isEnrolled
        }
      }
    });
  } catch (error) {
    console.error('خطا در دریافت دوره:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت دوره'
    });
  }
};

/**
 * ثبت‌نام در دوره (ایجاد درخواست پرداخت)
 */
export const enrollCourse = async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await prisma.course.findUnique({
      where: { slug }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'دوره یافت نشد'
      });
    }

    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'این دوره هنوز منتشر نشده است'
      });
    }

    // بررسی ثبت‌نام قبلی
    const existingEnrollment = await prisma.courseEnrollment.findFirst({
      where: {
        userId: req.user.id,
        courseId: course.id,
        status: 'COMPLETED'
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'شما قبلاً در این دوره ثبت‌نام کرده‌اید'
      });
    }

    // اگر دوره رایگان است
    if (course.price === 0n) {
      const enrollment = await prisma.courseEnrollment.create({
        data: {
          userId: req.user.id,
          courseId: course.id,
          pricePaid: 0n,
          status: 'COMPLETED'
        }
      });

      return res.json({
        success: true,
        message: 'ثبت‌نام با موفقیت انجام شد',
        data: { enrollment }
      });
    }

    // ایجاد درخواست پرداخت
    const { requestPayment } = await import('../services/zarinpal.js');
    const callbackUrl = process.env.ZARINPAL_CALLBACK_URL || `${process.env.BASE_URL}/api/v1/payment/callback`;

    const paymentResult = await requestPayment(
      Number(course.price),
      `پرداخت دوره ${course.title}`,
      callbackUrl,
      req.user.id,
      course.id
    );

    res.json({
      success: true,
      message: 'لینک پرداخت ایجاد شد',
      data: {
        paymentUrl: paymentResult.paymentUrl,
        authority: paymentResult.authority
      }
    });
  } catch (error) {
    console.error('خطا در ثبت‌نام:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطا در ثبت‌نام در دوره'
    });
  }
};

