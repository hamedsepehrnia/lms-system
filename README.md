# سیستم مدیریت یادگیری آنلاین (LMS) - پایا لایف

سیستم کامل مدیریت یادگیری آنلاین با احراز هویت مبتنی بر سشن و پرداخت Zarinpal.

## ویژگی‌ها

- ✅ احراز هویت مبتنی بر سشن (Session-based)
- ✅ ورود با شماره تلفن و OTP (Kavenegar)
- ✅ پرداخت آنلاین با Zarinpal
- ✅ مدیریت دوره‌ها و دروس
- ✅ تولید گواهینامه PDF با فونت فارسی
- ✅ نقش‌های کاربری: ADMIN, INSTRUCTOR, STUDENT
- ✅ مستندات کامل Swagger

## پیش‌نیازها

- Node.js 20+
- PostgreSQL 16+
- Docker & Docker Compose (اختیاری)

## نصب و راه‌اندازی

### 1. کلون کردن پروژه

```bash
git clone <repository-url>
cd "paya life new pg"
```

### 2. نصب وابستگی‌ها

```bash
npm install
```

### 3. راه‌اندازی دیتابیس

```bash
docker-compose up -d
```

یا استفاده از PostgreSQL موجود و تنظیم `DATABASE_URL` در `.env`

### 4. تنظیم متغیرهای محیطی

فایل `.env.example` را کپی کرده و به `.env` تغییر نام دهید:

```bash
cp .env.example .env
```

سپس مقادیر را تنظیم کنید:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/paya_life_lms?schema=public
SESSION_SECRET=your-super-secret-session-key-change-in-production
KAVENEGAR_API_KEY=your-kavenegar-api-key
ZARINPAL_MERCHANT_ID=your-zarinpal-merchant-id
```

### 5. اجرای Migration

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 6. Seed کردن دیتابیس

```bash
npm run seed
```

این دستور یک ادمین (09121234567)، 3 دسته‌بندی و یک دوره نمونه ایجاد می‌کند.

### 7. اجرای سرور

```bash
npm run dev
```

سرور روی `http://localhost:3000` اجرا می‌شود.

## دسترسی‌ها

### ادمین پیش‌فرض
- شماره تلفن: `09121234567`
- نقش: `ADMIN`

## API Documentation

مستندات کامل API در آدرس زیر در دسترس است:

```
http://localhost:3000/api-docs
```

## ساختار پروژه

```
src/
├── controllers/      # کنترلرهای API
├── middleware/       # میدلورها (auth, role, multer)
├── routes/          # Route handlers
├── services/        # سرویس‌های خارجی (Kavenegar, Zarinpal, PDF)
├── utils/           # توابع کمکی
├── prisma/          # Prisma schema
├── app.js           # تنظیمات Express
├── server.js        # نقطه ورود سرور
└── seed.js          # Seed script
```

## API Routes

### عمومی
- `POST /api/v1/auth/send-otp` - ارسال OTP
- `POST /api/v1/auth/verify-otp` - تایید OTP
- `GET /api/v1/courses` - لیست دوره‌ها
- `GET /api/v1/courses/:slug` - جزئیات دوره
- `GET /api/v1/categories` - لیست دسته‌بندی‌ها

### کاربری (نیاز به سشن)
- `GET /api/v1/me` - اطلاعات کاربر
- `PATCH /api/v1/me` - به‌روزرسانی پروفایل
- `GET /api/v1/my/courses` - دوره‌های من
- `POST /api/v1/courses/:slug/enroll` - ثبت‌نام در دوره
- `POST /api/v1/progress` - ثبت پیشرفت
- `GET /api/v1/certificates` - گواهینامه‌های من
- `GET /api/v1/certificates/:id/download` - دانلود گواهینامه

### مدرس
- `POST /api/v1/instructor/request` - درخواست مدرس شدن
- `GET /api/v1/instructor/my-courses` - دوره‌های مدرس
- `POST /api/v1/instructor/courses` - ایجاد دوره
- `PATCH /api/v1/instructor/courses/:id` - به‌روزرسانی دوره
- `POST /api/v1/instructor/courses/:id/lessons` - افزودن درس
- `GET /api/v1/instructor/sales-report` - گزارش فروش

### ادمین
- `GET /api/v1/admin/dashboard` - آمار سیستم
- `GET /api/v1/admin/instructor-requests` - درخواست‌های مدرس
- `PATCH /api/v1/admin/instructor-requests/:id` - تایید/رد درخواست
- `PATCH /api/v1/admin/courses/:id/publish` - انتشار دوره
- `POST /api/v1/admin/categories` - ایجاد دسته‌بندی
- `PATCH /api/v1/admin/categories/:id` - به‌روزرسانی دسته‌بندی
- `DELETE /api/v1/admin/categories/:id` - حذف دسته‌بندی

## تکنولوژی‌ها

- **Node.js** - Runtime
- **Express.js** - Web Framework
- **PostgreSQL** - Database
- **Prisma** - ORM
- **express-session** - Session Management
- **Kavenegar** - SMS Service
- **Zarinpal** - Payment Gateway
- **Multer** - File Upload
- **PDFKit** - PDF Generation
- **Swagger** - API Documentation

## لایسنس

ISC

