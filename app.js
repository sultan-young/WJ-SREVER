import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';
import { responseFormatter } from './middlewares/responseFormatter.js';
import apiRouter from './routes/index.js';

const app = express();
app.use(responseFormatter)

// 中间件
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 静态文件
app.use('/uploads', express.static('public/uploads'));

// 路由
app.use('/api/v1', apiRouter)

// 404处理
app.all('*', (req, res, next) => {
  next(new AppError(`找不到 ${req.originalUrl}`, 404));
});

// 全局错误处理
app.use(globalErrorHandler);

export default app;