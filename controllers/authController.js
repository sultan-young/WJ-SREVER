import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Supplier from '../models/Supplier.js';
import AppError from '../utils/appError.js';

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    
    let user;
    if (role === 'admin') {
      user = await Admin.findOne({ email });
    } else {
      user = await Supplier.findOne({ email });
    }

    if (!user || !(await user.correctPassword(password))) {
      return next(new AppError('邮箱或密码错误', 401));
    }

    const token = signToken(user._id, role);
    
    res.status(200).json({
      status: 'success',
      token,
      data: {
        id: user._id,
        role
      }
    });
  } catch (err) {
    next(err);
  }
};