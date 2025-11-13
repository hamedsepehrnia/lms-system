import { body, validationResult } from 'express-validator';

/**
 * بررسی نتایج validation
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'خطا در اعتبارسنجی داده‌ها',
      errors: errors.array()
    });
  }
  next();
};

/**
 * Validation rules برای ارسال OTP
 */
export const validateSendOTP = [
  body('phone')
    .notEmpty()
    .withMessage('شماره تلفن الزامی است')
    .matches(/^09\d{9}$/)
    .withMessage('فرمت شماره تلفن صحیح نیست (مثال: 09123456789)'),
  handleValidationErrors
];

/**
 * Validation rules برای تایید OTP
 */
export const validateVerifyOTP = [
  body('phone')
    .notEmpty()
    .withMessage('شماره تلفن الزامی است')
    .matches(/^09\d{9}$/)
    .withMessage('فرمت شماره تلفن صحیح نیست'),
  body('code')
    .notEmpty()
    .withMessage('کد تایید الزامی است')
    .isLength({ min: 6, max: 6 })
    .withMessage('کد تایید باید 6 رقمی باشد')
    .isNumeric()
    .withMessage('کد تایید باید عددی باشد'),
  handleValidationErrors
];

/**
 * Validation rules برای به‌روزرسانی پروفایل
 */
export const validateUpdateProfile = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('نام باید بین 2 تا 100 کاراکتر باشد'),
  handleValidationErrors
];

/**
 * Validation rules برای ایجاد دوره
 */
export const validateCreateCourse = [
  body('title')
    .notEmpty()
    .withMessage('عنوان دوره الزامی است')
    .isLength({ min: 3, max: 200 })
    .withMessage('عنوان باید بین 3 تا 200 کاراکتر باشد'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('توضیحات نباید بیشتر از 2000 کاراکتر باشد'),
  body('price')
    .notEmpty()
    .withMessage('قیمت الزامی است')
    .isInt({ min: 0 })
    .withMessage('قیمت باید عدد مثبت باشد'),
  body('categoryId')
    .notEmpty()
    .withMessage('دسته‌بندی الزامی است')
    .isUUID()
    .withMessage('شناسه دسته‌بندی نامعتبر است'),
  handleValidationErrors
];

/**
 * Validation rules برای ایجاد درس
 */
export const validateCreateLesson = [
  body('title')
    .notEmpty()
    .withMessage('عنوان درس الزامی است')
    .isLength({ min: 3, max: 200 })
    .withMessage('عنوان باید بین 3 تا 200 کاراکتر باشد'),
  body('orderIndex')
    .notEmpty()
    .withMessage('ترتیب درس الزامی است')
    .isInt({ min: 1 })
    .withMessage('ترتیب باید عدد مثبت باشد'),
  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('مدت زمان باید عدد مثبت باشد'),
  body('isFree')
    .optional()
    .isBoolean()
    .withMessage('isFree باید true یا false باشد'),
  handleValidationErrors
];

/**
 * Validation rules برای ثبت پیشرفت
 */
export const validateProgress = [
  body('lessonId')
    .notEmpty()
    .withMessage('شناسه درس الزامی است')
    .isUUID()
    .withMessage('شناسه درس نامعتبر است'),
  body('isCompleted')
    .notEmpty()
    .withMessage('وضعیت تکمیل الزامی است')
    .isBoolean()
    .withMessage('isCompleted باید true یا false باشد'),
  handleValidationErrors
];

