import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ایجاد پوشه‌های لازم
const uploadsDir = path.join(__dirname, '../../public/uploads');
const coursesDir = path.join(uploadsDir, 'courses');
const lessonsDir = path.join(uploadsDir, 'lessons');
const avatarsDir = path.join(uploadsDir, 'avatars');

[uploadsDir, coursesDir, lessonsDir, avatarsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// تنظیمات ذخیره‌سازی
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
      cb(null, coursesDir);
    } else if (file.fieldname === 'video') {
      cb(null, lessonsDir);
    } else if (file.fieldname === 'avatar') {
      cb(null, avatarsDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// فیلتر فایل‌ها
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];

  if (file.fieldname === 'thumbnail' || file.fieldname === 'avatar') {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('فرمت تصویر مجاز نیست. فقط JPEG, PNG, WebP مجاز است'), false);
    }
  } else if (file.fieldname === 'video') {
    if (allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('فرمت ویدیو مجاز نیست. فقط MP4, WebM, OGG مجاز است'), false);
    }
  } else {
    cb(null, true);
  }
};

// محدودیت حجم فایل
const limits = {
  fileSize: 524288000 // 500MB برای ویدیو
};

// آپلود تصویر (thumbnail یا avatar)
export const uploadImage = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('فرمت تصویر مجاز نیست'), false);
    }
  },
  limits: {
    fileSize: 2097152 // 2MB
  }
});

// آپلود ویدیو
export const uploadVideo = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('فرمت ویدیو مجاز نیست'), false);
    }
  },
  limits: {
    fileSize: 524288000 // 500MB
  }
});

// آپلود چندگانه
export const upload = multer({
  storage,
  fileFilter,
  limits
});

