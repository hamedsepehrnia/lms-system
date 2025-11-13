import { PrismaClient } from '@prisma/client';
import { verifyPayment } from '../services/zarinpal.js';

const prisma = new PrismaClient();

/**
 * Callback پرداخت Zarinpal
 */
export const paymentCallback = async (req, res) => {
  try {
    const { Authority, Status } = req.query;

    if (Status !== 'OK') {
      return res.redirect(`${process.env.BASE_URL}/payment/failed?authority=${Authority}`);
    }

    // پیدا کردن تراکنش
    const transaction = await prisma.transaction.findFirst({
      where: {
        authority: Authority,
        status: 'PENDING'
      }
    });

    if (!transaction) {
      return res.redirect(`${process.env.BASE_URL}/payment/failed?error=transaction_not_found`);
    }

    // تایید پرداخت
    const verifyResult = await verifyPayment(Authority, Number(transaction.amount));

    if (!verifyResult.success) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' }
      });
      return res.redirect(`${process.env.BASE_URL}/payment/failed?error=verification_failed`);
    }

    // به‌روزرسانی تراکنش
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: 'COMPLETED',
        refId: verifyResult.refId
      }
    });

    // ایجاد ثبت‌نام
    if (transaction.courseId) {
      await prisma.courseEnrollment.create({
        data: {
          userId: transaction.userId,
          courseId: transaction.courseId,
          pricePaid: transaction.amount,
          transactionId: transaction.id,
          status: 'COMPLETED'
        }
      });
    }

    res.redirect(`${process.env.BASE_URL}/payment/success?refId=${verifyResult.refId}`);
  } catch (error) {
    console.error('خطا در callback پرداخت:', error);
    res.redirect(`${process.env.BASE_URL}/payment/failed?error=server_error`);
  }
};

