import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📚 API Documentation: ${process.env.BASE_URL || 'http://localhost:3000'}/api-docs`);
  console.log(`🏥 Health check: ${process.env.BASE_URL || 'http://localhost:3000'}/health`);
});

