import Admin from '../models/Admin.js';
import AppError from '../utils/appError.js';
import jwt from 'jsonwebtoken';

export const createAdmin = async (req, res, next) => {
  try {
    const newAdmin = await Admin.create(req.body);
    res.status(201).json({
      status: 'success',
      data: newAdmin
    });
  } catch (err) {
    next(err);
  }
};

export const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find().select('-password');
    res.status(200).json({
      status: 'success',
      results: admins.length,
      data: admins
    });
  } catch (err) {
    next(err);
  }
};