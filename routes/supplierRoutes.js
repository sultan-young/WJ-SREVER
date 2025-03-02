import express from 'express';
import { protect } from '../middlewares/auth.js';
import { getSupplierProductList, getSupplierList } from '../controllers/supplierController.js';

const router = express.Router();

// router.use(protect(['supplier']));

router.post('/getSupplierList', getSupplierList);
router.post('/product/list', getSupplierProductList);

export default router;