# Postman Collection - Paya Life LMS API

این پوشه شامل فایل Postman Collection برای تست کامل API های سیستم مدیریت یادگیری آنلاین است.

## نصب در Postman

### روش 1: Import مستقیم
1. Postman را باز کنید
2. روی دکمه **Import** کلیک کنید
3. فایل `Paya_Life_LMS.postman_collection.json` را انتخاب کنید
4. Collection به Postman اضافه می‌شود

### روش 2: Import از URL
1. Postman را باز کنید
2. روی دکمه **Import** کلیک کنید
3. گزینه **Link** را انتخاب کنید
4. URL فایل را وارد کنید (اگر در Git قرار دارد)

## تنظیمات اولیه

### Environment Variables

بعد از Import، یک Environment در Postman ایجاد کنید و متغیرهای زیر را تنظیم کنید:

```
base_url: http://localhost:3000
```

یا اگر سرور روی پورت دیگری اجرا می‌شود:

```
base_url: http://localhost:YOUR_PORT
```

## نحوه استفاده

### 1. احراز هویت

1. **Send OTP**: شماره تلفن خود را وارد کنید
   ```json
   {
     "phone": "09123456789"
   }
   ```
   - اگر `OTP_DEBUG_MODE=true` باشد، کد در ترمینال نمایش داده می‌شود
   - در غیر این صورت، پیامک ارسال می‌شود

2. **Verify OTP**: کد دریافتی را وارد کنید
   ```json
   {
     "phone": "09123456789",
     "code": "123456"
   }
   ```
   - بعد از موفقیت، Session Cookie به صورت خودکار ذخیره می‌شود
   - در تمام درخواست‌های بعدی، Cookie به صورت خودکار ارسال می‌شود

### 2. تست API ها

بعد از ورود موفق، می‌توانید تمام API های دیگر را تست کنید:

- **User APIs**: دریافت و به‌روزرسانی پروفایل
- **Course APIs**: مشاهده و ثبت‌نام در دوره‌ها
- **Instructor APIs**: مدیریت دوره‌ها (نیاز به نقش INSTRUCTOR)
- **Admin APIs**: مدیریت سیستم (نیاز به نقش ADMIN)

## نکات مهم

### Session Management
- Session به صورت Cookie در Postman ذخیره می‌شود
- Cookie نام: `lms.sid`
- برای تست در Postman، گزینه **Send cookies** باید فعال باشد

### Roles
- **STUDENT**: دسترسی به API های عمومی و کاربری
- **INSTRUCTOR**: دسترسی به API های مدرس + STUDENT
- **ADMIN**: دسترسی کامل به تمام API ها

### File Upload
برای API هایی که فایل آپلود می‌کنند:
- در Postman، Body را روی **form-data** تنظیم کنید
- فیلد فایل را از نوع **File** انتخاب کنید
- فایل را انتخاب کنید

## ساختار Collection

```
Paya Life LMS API
├── Authentication
│   ├── Send OTP
│   ├── Verify OTP
│   └── Logout
├── User
│   ├── Get Current User
│   ├── Update Profile
│   └── Get My Courses
├── Courses
│   ├── Get All Courses
│   ├── Get Course by Slug
│   └── Enroll in Course
├── Categories
│   └── Get All Categories
├── Payment
│   └── Payment Callback
├── Progress
│   └── Update Progress
├── Certificates
│   ├── Get My Certificates
│   └── Download Certificate
├── Instructor
│   ├── Request Instructor
│   ├── Get My Instructor Courses
│   ├── Create Course
│   ├── Update Course
│   ├── Add Lesson to Course
│   └── Get Sales Report
├── Admin
│   ├── Get Dashboard Stats
│   ├── Get Instructor Requests
│   ├── Handle Instructor Request
│   ├── Publish Course
│   ├── Create Category
│   ├── Update Category
│   └── Delete Category
└── Health Check
    └── Health Check
```

## Troubleshooting

### مشکل: Session ذخیره نمی‌شود
- مطمئن شوید که در Postman، گزینه **Send cookies** فعال است
- بعد از Verify OTP، Cookie باید در بخش Cookies نمایش داده شود

### مشکل: 401 Unauthorized
- ابتدا باید با Send OTP و Verify OTP وارد شوید
- مطمئن شوید که Cookie به درستی ارسال می‌شود

### مشکل: 403 Forbidden
- بررسی کنید که نقش کاربر شما برای این API کافی است
- برای API های Instructor، باید نقش INSTRUCTOR داشته باشید
- برای API های Admin، باید نقش ADMIN داشته باشید

## مثال استفاده

### مثال کامل: ورود و دریافت اطلاعات کاربر

1. **Send OTP**
   ```
   POST /api/v1/auth/send-otp
   Body: { "phone": "09123456789" }
   ```

2. **Verify OTP** (کد را از ترمینال یا پیامک بگیرید)
   ```
   POST /api/v1/auth/verify-otp
   Body: { "phone": "09123456789", "code": "123456" }
   ```

3. **Get Current User**
   ```
   GET /api/v1/me
   (Cookie به صورت خودکار ارسال می‌شود)
   ```

## لینک‌های مفید

- **Swagger Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

