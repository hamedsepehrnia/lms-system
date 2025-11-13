import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import jalaliMoment from 'jalali-moment';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * تولید گواهینامه PDF با فونت فارسی
 */
export const generateCertificate = async (certificateId) => {
  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    include: {
      user: true,
      course: true
    }
  });

  if (!certificate) {
    throw new Error('گواهینامه یافت نشد');
  }

  // ایجاد سند PDF
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50
    }
  });

  // مسیر ذخیره فایل
  const certificatesDir = path.join(__dirname, '../../public/uploads/certificates');
  if (!fs.existsSync(certificatesDir)) {
    fs.mkdirSync(certificatesDir, { recursive: true });
  }

  const filePath = path.join(certificatesDir, `certificate-${certificateId}.pdf`);

  // ایجاد stream برای نوشتن فایل
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // پس‌زمینه و قاب
  doc.rect(0, 0, doc.page.width, doc.page.height)
     .fillColor('#f8f9fa')
     .fill();

  // قاب طلایی
  doc.strokeColor('#d4af37')
     .lineWidth(10)
     .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
     .stroke();

  // عنوان
  // توجه: برای نمایش بهتر فارسی، می‌توانید فایل فونت فارسی (مثل Vazir) را اضافه کنید
  // doc.font('path/to/vazir-font.ttf');
  doc.fontSize(36)
     .fillColor('#2c3e50')
     .text('گواهینامه تکمیل دوره', {
       align: 'center',
       y: 100
     });

  // متن اصلی
  doc.fontSize(20)
     .fillColor('#34495e')
     .text('این گواهینامه به', {
       align: 'center',
       y: 180
     });

  doc.fontSize(28)
     .fillColor('#2c3e50')
     .text(certificate.user.name || certificate.user.phone, {
       align: 'center',
       y: 220
     });

  doc.fontSize(20)
     .fillColor('#34495e')
     .text('برای تکمیل موفقیت‌آمیز دوره', {
       align: 'center',
       y: 280
     });

  doc.fontSize(24)
     .fillColor('#2c3e50')
     .text(certificate.course.title, {
       align: 'center',
       y: 320
     });

  // تاریخ
  const jalaliDate = jalaliMoment(certificate.issuedAt).format('jYYYY/jMM/jDD');
  doc.fontSize(16)
     .fillColor('#7f8c8d')
     .text(`تاریخ صدور: ${jalaliDate}`, {
       align: 'center',
       y: 380
     });

  // شماره گواهینامه
  doc.fontSize(14)
     .fillColor('#95a5a6')
     .text(`شماره گواهینامه: ${certificate.certificateNumber}`, {
       align: 'center',
       y: 420
     });

  // تولید QR Code
  const qrData = `${process.env.BASE_URL}/api/v1/certificates/${certificateId}/verify`;
  const qrCodeDataURL = await QRCode.toDataURL(qrData, {
    width: 150,
    margin: 1
  });

  // اضافه کردن QR Code
  doc.image(qrCodeDataURL, doc.page.width / 2 - 75, doc.page.height - 200, {
    width: 150,
    height: 150
  });

  // امضا
  doc.fontSize(14)
     .fillColor('#7f8c8d')
     .text('امضای مدیر سیستم', {
       align: 'right',
       x: doc.page.width - 100,
       y: doc.page.height - 100
     });

  // پایان سند
  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      resolve(filePath);
    });
    stream.on('error', reject);
  });
};

