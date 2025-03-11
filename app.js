import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import productRouter from './routes/productRoutes.js';
import authRouter from './routes/authRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import shelfRouter from './routes/shelfRoutes.js';
import supplierRouter from './routes/supplierRoutes.js';
import orderRouter from './routes/supplierOrderRoutes.js';
import ProxyRouter from './routes/proxy.js';
import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';
import { responseFormatter } from './middlewares/responseFormatter.js';

const app = express();
app.use(responseFormatter)

// 中间件
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 静态文件
app.use('/uploads', express.static('public/uploads'));

// 路由
app.use('/api/v1/products', productRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/supplier', supplierRouter);
app.use('/api/v1/shelf', shelfRouter);
app.use('/api/v1/supplierOrder', orderRouter);
app.use('/api/v1/proxy', ProxyRouter);

// 404处理
app.all('*', (req, res, next) => {
  next(new AppError(`找不到 ${req.originalUrl}`, 404));
});

// 全局错误处理
app.use(globalErrorHandler);

export default app;