import md5 from "md5";
import Product from "../models/Product.js";
import APIFeatures from "../utils/apiFeatures.js";
import AppError from "../utils/appError.js";
import axios from 'axios'

export const createProduct = async (req, res, next) => {
  try {
    // 自动关联供应商（供应商用户）
    if (req.user.role === "supplier") {
      req.body.suppliers = [req.user.id];
    }

    const newProduct = await Product.create(req.body);

    res.status(201).json({
      status: "success",
      data: newProduct,
    });
  } catch (err) {
    next(err);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const features = new APIFeatures(Product.find(), req.query)
      .filter()
      .sort()
      // .limitFields()
      .paginate();

    // 供应商只能查看自己的商品
    if (req.user.role === "supplier") {
      features.query = features.query.find({ suppliers: req.user.id });
    }

    const products = await features.query;

    res.status(200).json({
      status: "success",
      success: true,
      results: products.length,
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

const superbedUserToken = "3e4a28623c31448ba051ea446b0f7d88";
const superbedUserId = "145566";
export const getUploadProductImageSign = async (req, res, next) => {
  const ts = Date.now();
  const sign = md5(`${superbedUserId}-${superbedUserToken}-${ts}`);
  res.status(200).json({
    status: "success",
    success: true,
    data: {
      sign: sign,
      id: superbedUserId,
      ts,
    },
  });
};

export const deleteProductImage = async (req, res, next) => {
  axios.post('https://api.superbed.cn/delete', {
    token: superbedUserToken,
    ids: req.body.ids
  }).then(result => {
    res.status(200).json({
      status: "success",
      success: true,
      data: result.data,
    });
  })
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return next(new AppError("找不到该商品", 404));
    }

    res.status(200).json({
      status: "success",
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return next(new AppError("找不到该商品", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
