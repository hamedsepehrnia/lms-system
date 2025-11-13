import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ثبت یا به‌روزرسانی پیشرفت کاربر
 */
export const updateProgress = async (req, res) => {
  try {
    const { lessonId, isCompleted } = req.body;
    const userId = req.user.id;

    // بررسی وجود درس
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          include: {
            enrollments: {
              where: {
                userId,
                status: 'COMPLETED'
              }
            }
          }
        }
      }
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'درس یافت نشد'
      });
    }

    // بررسی ثبت‌نام در دوره
    if (lesson.course.enrollments.length === 0 && !lesson.isFree) {
      return res.status(403).json({
        success: false,
        message: 'شما در این دوره ثبت‌نام نکرده‌اید'
      });
    }

    // ثبت یا به‌روزرسانی پیشرفت
    const progress = await prisma.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId
        }
      },
      update: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null
      },
      create: {
        userId,
        lessonId,
        isCompleted,
        completedAt: isCompleted ? new Date() : null
      }
    });

    // بررسی تکمیل دوره برای صدور گواهینامه
    if (isCompleted) {
      await checkAndIssueCertificate(userId, lesson.courseId);
    }

    res.json({
      success: true,
      message: 'پیشرفت با موفقیت ثبت شد',
      data: { progress }
    });
  } catch (error) {
    console.error('خطا در ثبت پیشرفت:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در ثبت پیشرفت'
    });
  }
};

/**
 * بررسی تکمیل دوره و صدور گواهینامه
 */
async function checkAndIssueCertificate(userId, courseId) {
  // دریافت تمام دروس دوره
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: true
    }
  });

  if (!course) return;

  // بررسی تکمیل تمام دروس
  const completedLessons = await prisma.userProgress.count({
    where: {
      userId,
      lessonId: {
        in: course.lessons.map(l => l.id)
      },
      isCompleted: true
    }
  });

  // اگر تمام دروس تکمیل شده‌اند
  if (completedLessons === course.lessons.length) {
    // بررسی وجود گواهینامه قبلی
    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        userId,
        courseId
      }
    });

    if (!existingCertificate) {
      // تولید شماره گواهینامه
      const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      await prisma.certificate.create({
        data: {
          userId,
          courseId,
          certificateNumber
        }
      });
    }
  }
}

