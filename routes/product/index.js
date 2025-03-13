import express from "express";
import productCategoryRouter from './productRoutes.js'
import ProductCateGoryRoute from "./categoryRoutes.js";

const productRouter = express.Router();
productRouter.use('/', productCategoryRouter)
productRouter.use('/cateGory', ProductCateGoryRoute)

export default productRouter;
