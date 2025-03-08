import { ROLE } from "../constant/role.js";
import Admin from "../models/Admin.js";
import AppError from "../utils/appError.js";
import jwt from "jsonwebtoken";

export const createAdmin = async (req, res, next) => {
  try {
    const newAdmin = await Admin.create({
      ...req.body,
      role: ROLE.ADMIN,
    });
    res.status(201).json({
      status: "success",
      success: true,
      data: newAdmin,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find().select("-password");
    return res.success(admins);
  } catch (err) {
    next(err);
  }
};

export const loginAdmin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    let user = await Admin.findOne({ username });

    if (!user) {
      return next(new AppError("未知用户", 401));
    }

    if (!(await user.correctPassword(password))) {
      return next(new AppError("校验失败", 401));
    }

    const token = jwt.sign(
      { id: user._id, password, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    return res.success({
      token,
      userInfo: {},
    });
  } catch (err) {
    next(err);
  }
};
