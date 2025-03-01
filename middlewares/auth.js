import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Supplier from '../models/Supplier.js';
import AppError from '../utils/appError.js';

export const protect = (roles) => async (req, res, next) => {
  try {
    // 1. 获取token
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) throw new AppError('请先登录系统', 401);

    // 2. 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. 获取用户
    let currentUser;
    if (decoded.role === 'admin') {
      currentUser = await Admin.findById(decoded.id);
    } else {
      currentUser = await Supplier.findById(decoded.id);
    }

    if (!currentUser) throw new AppError('用户不存在', 401);

    // 4. 验证权限
    if (!roles.includes(decoded.role)) {
      throw new AppError('无权进行此操作', 403);
    }

    // 5. 附加用户信息
    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};