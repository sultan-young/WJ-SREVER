import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.js';

export const protect = (roles) => async (req, res, next) => {
  try {
    // 1) 获取token
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    // 2) 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) 检查用户是否存在
    let currentUser;
    if (decoded.role === 'admin') {
      currentUser = await Admin.findById(decoded.id);
    } else {
      currentUser = await Supplier.findById(decoded.id);
    }

    if (!currentUser) {
      return next(new AppError('The user no longer exists.', 401));
    }

    // 4) 检查权限
    if (!roles.includes(decoded.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    // 5) 附加用户到请求对象
    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};