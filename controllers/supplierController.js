import Supplier from "../models/Supplier.js";
import AppError from "../utils/appError.js";
import jwt from "jsonwebtoken";

export const createSupplier = async (req, res, next) => {
  try {
    const newSupplier = await Supplier.create(req.body);
    res.status(201).json({
      status: "success",
      data: newSupplier,
    });
  } catch (err) {
    next(err);
  }
};

export const getSupplierList = async (req, res, next) => {
  const supplierList = await Supplier.find({}, {
    __v: 0
  });

  res.status(200).json({
    status: "success",
    success: true,
    data: supplierList,
  });
  try {
  } catch (err) {
    next(err);
  }
};

export const getSupplierProductList = async (req, res, next) => {
  try {
    const products = await Product.find({ suppliers: req.user.id });
    res.status(200).json({
      status: "success",
      results: products.length,
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

export const supplierLogin = async (req, res, next) => {
  try {
    const { supplierId } = req.body;

    let user;
    user = await Supplier.findOne({ supplierId });

    if (!user) {
      return next(new AppError("身份验证失败", 401));
    }

    const token = jwt.sign({ id: supplierId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(200).json({
      status: "success",
      data: {
        token,
        userInfo: {
          id: user._id,
          email: "1234",
          address: "123123",
          phone: "123123",
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
