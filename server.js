import app from './app.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

const PORT = process.env.PORT || 5000;

// 连接数据库后启动服务
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});