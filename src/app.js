import express from 'express';
import cors from 'cors';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { PrismaClient } from '@prisma/client';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import instructorRoutes from './routes/instructorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();

// تنظیمات CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// تنظیمات Session
const pgSessionStore = pgSession(session);
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.use(session({
  store: new pgSessionStore({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  },
  name: 'lms.sid'
}));

// تنظیمات Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API سیستم مدیریت یادگیری آنلاین (LMS)',
      version: '1.0.0',
      description: 'API کامل برای سیستم مدیریت یادگیری آنلاین با احراز هویت مبتنی بر سشن',
      contact: {
        name: 'پایا لایف'
      }
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:3000',
        description: 'سرور توسعه'
      }
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'lms.sid'
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'مستندات API - پایا لایف'
}));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/me', userRoutes);
app.use('/api/v1/my', userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/certificates', certificateRoutes);
app.use('/api/v1/instructor', instructorRoutes);
app.use('/api/v1/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'مسیر یافت نشد'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('خطا:', err);

  // خطاهای multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'حجم فایل بیش از حد مجاز است'
    });
  }

  if (err.message && err.message.includes('فرمت')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'خطای سرور',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;

