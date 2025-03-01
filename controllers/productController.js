import Product from '../models/Product.js';
import AppError from '../utils/appError.js';
import APIFeatures from '../utils/apiFeatures.js';

export const createProduct = async (req, res, next) => {
  try {
    // 自动关联供应商（如果是供应商登录）
    if (req.user.role === 'supplier') {
      req.body.suppliers = [req.user.id];
    }

    const newProduct = await Product.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: newProduct
    });
  } catch (err) {
    next(err);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    // 1. 构建查询
    const features = new APIFeatures(Product.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // 2. 如果是供应商，只能查看自己的商品
    if (req.user.role === 'supplier') {
      features.query = features.query.find({ suppliers: req.user.id });
    }

    const products = await features.query;

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: products
    });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return next(new AppError('找不到该商品', 404));
    }

    res.status(200).json({
      status: 'success',
      data: product
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return next(new AppError('找不到该商品', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};