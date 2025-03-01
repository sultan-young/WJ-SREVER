import express from 'express';
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { protect } from '../middlewares/auth.js';
import { upload } from '../config/storage.js';

const router = express.Router();

router
  .route('/')
  .get(protect(['admin', 'supplier']), getProducts)
  .post(
    protect(['admin', 'supplier']),
    upload.array('images'),
    createProduct
  );

router
  .route('/:id')
  .patch(
    protect(['admin']),
    upload.array('images'),
    updateProduct
  )
  .delete(
    protect(['admin']),
    deleteProduct
  );

export default router;