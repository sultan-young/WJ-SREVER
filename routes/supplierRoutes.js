import express from 'express';
import { protect } from '../middlewares/auth.js';
import { getSupplierProducts } from '../controllers/supplierController.js';

const router = express.Router();

// router.use(protect(['supplier']));

router.get('/products', getSupplierProducts);

export default router;