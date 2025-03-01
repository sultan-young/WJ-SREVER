import Supplier from "../models/Supplier.js";
import AppError from "../utils/appError.js";
import jwt from 'jsonwebtoken';

export const createSupplier = async (req, res, next) => {
  try {
    console.log(req.body)
    const newSupplier = await Supplier.create(req.body);
    res.status(201).json({
      status: "success",
      data: newSupplier,
    });
  } catch (err) {
    next(err);
  }
};

export const getSupplierProducts = async (req, res, next) => {
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
    console.log(supplierId, 'supplierId')

    let user;
    user = await Supplier.findOne({ supplierId });
    console.log(user, 'user')

    if (!user) {
      return next(new AppError("身份验证失败", 401));
    }

    const token = jwt.sign({ id: supplierId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    console.log(token)

    res.status(200).json({
      status: "success",
      data: {
        token,
        userInfo: {
            id: user._id,
            email: "1234",
            address: "123123",
            phone: "123123",
        }
      },
    });
  } catch (err) {
    next(err);
  }
};
