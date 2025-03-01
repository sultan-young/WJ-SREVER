import express from 'express';
import { login } from '../controllers/authController.js';
import { createAdmin } from '../controllers/adminController.js';
import { supplierLogin, createSupplier } from '../controllers/supplierController.js';

const router = express.Router();

router.use('/login/admin', createAdmin);
router.use('/login/supplier', supplierLogin)
router.use('/create/supplier', createSupplier)

export default router;