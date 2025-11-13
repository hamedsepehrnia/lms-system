import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * بررسی وجود سشن و احراز هویت کاربر
 */
export const requireAuth = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'لطفاً ابتدا وارد حساب کاربری خود شوید'
      });
    }

    // بررسی وجود کاربر در دیتابیس
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        avatar: true
      }
    });

    if (!user) {
      req.session.destroy();
      return res.status(401).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('خطا در احراز هویت:', error);
    res.status(500).json({
      success: false,
      message: 'خطای سرور در احراز هویت'
    });
  }
};

