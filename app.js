import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import productRouter from './routes/productRoutes.js';
import authRouter from './routes/authRoutes.js';
import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 静态文件服务
app.use('/uploads', express.static('public/uploads'));

// 路由
app.use('/api/v1/products', productRouter);
app.use('/api/v1/auth', authRouter);

// 错误处理
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;