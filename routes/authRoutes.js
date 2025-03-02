import express from 'express';
import { createAdmin, loginAdmin } from '../controllers/adminController.js';
import { supplierLogin, createSupplier } from '../controllers/supplierController.js';

const router = express.Router();

router.use('/create/admin', createAdmin);
router.use('/login/admin', loginAdmin);
router.use('/login/supplier', supplierLogin)
router.use('/create/supplier', createSupplier)

export default router;