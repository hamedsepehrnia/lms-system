import https from 'https';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SANDBOX_URL = 'https://sandbox.zarinpal.com/pg/v4/payment';
const PRODUCTION_URL = 'https://api.zarinpal.com/pg/v4/payment';

/**
 * ایجاد درخواست پرداخت در Zarinpal
 */
export const requestPayment = async (amount, description, callbackUrl, userId, courseId) => {
  return new Promise((resolve, reject) => {
    const merchantId = process.env.ZARINPAL_MERCHANT_ID;
    const isSandbox = process.env.ZARINPAL_SANDBOX === 'true';
    const baseUrl = isSandbox ? SANDBOX_URL : PRODUCTION_URL;

    const postData = JSON.stringify({
      merchant_id: merchantId,
      amount: amount,
      description: description,
      callback_url: callbackUrl,
      metadata: {
        mobile: '',
        email: ''
      }
    });

    const options = {
      hostname: isSandbox ? 'sandbox.zarinpal.com' : 'api.zarinpal.com',
      path: '/pg/v4/payment/request.json',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', async () => {
        try {
          const result = JSON.parse(data);

          if (result.data && result.data.code === 100) {
            // ذخیره تراکنش در دیتابیس
            const transaction = await prisma.transaction.create({
              data: {
                userId,
                courseId,
                amount: BigInt(amount),
                authority: result.data.authority,
                status: 'PENDING'
              }
            });

            resolve({
              authority: result.data.authority,
              paymentUrl: `${baseUrl}/start/${result.data.authority}`,
              transactionId: transaction.id
            });
          } else {
            reject(new Error(result.errors?.message || 'خطا در ایجاد درخواست پرداخت'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

/**
 * تایید پرداخت در Zarinpal
 */
export const verifyPayment = async (authority, amount) => {
  return new Promise((resolve, reject) => {
    const merchantId = process.env.ZARINPAL_MERCHANT_ID;
    const isSandbox = process.env.ZARINPAL_SANDBOX === 'true';

    const postData = JSON.stringify({
      merchant_id: merchantId,
      authority: authority,
      amount: amount
    });

    const options = {
      hostname: isSandbox ? 'sandbox.zarinpal.com' : 'api.zarinpal.com',
      path: '/pg/v4/payment/verify.json',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);

          if (result.data && result.data.code === 100) {
            resolve({
              success: true,
              refId: result.data.ref_id,
              cardHash: result.data.card_hash,
              fee: result.data.fee
            });
          } else if (result.data && result.data.code === 101) {
            resolve({
              success: false,
              message: 'این تراکنش قبلاً تایید شده است'
            });
          } else {
            reject(new Error(result.errors?.message || 'خطا در تایید پرداخت'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

