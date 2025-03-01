import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Supplier from '../models/Supplier.js';
import AppError from '../utils/appError.js';

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

export const adminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    const admin = await Admin.findOne({ username });
    if (!admin || !(await admin.correctPassword(password))) {
      return next(new AppError('Invalid credentials', 401));
    }

    const token = signToken(admin._id, 'admin');
    
    res.status(200).json({
      status: 'success',
      token,
      data: { id: admin._id }
    });
  } catch (err) {
    next(err);
  }
};

export const supplierLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const supplier = await Supplier.findOne({ email });
    if (!supplier || !(await supplier.correctPassword(password))) {
      return next(new AppError('Invalid credentials', 401));
    }

    const token = signToken(supplier._id, 'supplier');
    
    res.status(200).json({
      status: 'success',
      token,
      data: { id: supplier._id }
    });
  } catch (err) {
    next(err);
  }
};