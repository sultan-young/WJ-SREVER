// routes/apiRoutes.js
import express from 'express';
import productRouter from './product/index.js';
import authRouter from './authRoutes.js';
import makeOrderRouter from './makeOrder.js';
import supplierRouter from './supplierRoutes.js';
import orderRouter from './supplierOrderRoutes.js';
import shopRouter from './shopRoutes.js';
import ProxyRouter from './proxy.js';

const apiRouter = express.Router();

// 挂载各个模块的路由
apiRouter.use('/products', productRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/supplier', supplierRouter);
apiRouter.use('/supplierOrder', orderRouter);
apiRouter.use('/shop', shopRouter);
apiRouter.use('/proxy', ProxyRouter);
apiRouter.use('/makeOrder', makeOrderRouter);

export default apiRouter;