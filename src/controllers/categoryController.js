import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * دریافت لیست دسته‌بندی‌ها
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            courses: {
              where: {
                isPublished: true
              }
            }
          }
        }
      },
      orderBy: {
        title: 'asc'
      }
    });

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('خطا در دریافت دسته‌بندی‌ها:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت دسته‌بندی‌ها'
    });
  }
};

