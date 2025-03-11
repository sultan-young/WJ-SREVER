import { ROLE } from "../constant/role.js";
import Supplier from "../models/Supplier.js";
import AppError from "../utils/appError.js";
import jwt from "jsonwebtoken";

export const createSupplier = async (req, res, next) => {
  try {
    const newSupplier = await Supplier.create({
      ...req.body,
      role: ROLE.SUPPLIER,
    });
    res.status(201).json({
      status: "success",
      success: true,
      data: newSupplier,
    });
  } catch (err) {
    next(err);
  }
};

export const getSupplierList = async (req, res, next) => {
  try {
    const supplierList = await Supplier.find(
      {},
      {
        __v: 0,
      }
    );
    return res.success(supplierList);
  } catch (err) {
    next(err);
  }
};

export const getSupplierProductList = async (req, res, next) => {
  try {
    const products = await Product.find({ suppliers: req.user.id });
    return res.success(products);
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

    const token = jwt.sign(
      { supplierId: supplierId, role: user.role, id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    return res.success({
      token,
      userInfo: {
        id: user._id,
        email: user.email,
        address: user.address,
        phone: user.phone,
      },
    });
  } catch (err) {
    next(err);
  }
};
