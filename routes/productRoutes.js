import express from "express";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getUploadProductImageSign,
  deleteProductImage,
  searchProducts,
} from "../controllers/productController.js";
import { protect } from "../middlewares/auth.js";
import { upload } from "../config/storage.js";
import { ROLE } from "../constant/role.js";

const router = express.Router();

router
  .route("/list")
  .post(protect([ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.SUPPLIER]), getProducts);

router
  .route("/search")
  .post(protect([ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.SUPPLIER]), searchProducts);

router
  .route("/create")
  .post(
    protect([ROLE.SUPER_ADMIN, ROLE.ADMIN]),
    upload.array("images"),
    createProduct
  );

router
  .route("/update")
  .post(
    protect([ROLE.SUPER_ADMIN, ROLE.ADMIN]),
    upload.array("images"),
    updateProduct
  );

router
  .route("/delete")
  .post(
    protect([ROLE.SUPER_ADMIN, ROLE.ADMIN]),
    upload.array("images"),
    deleteProduct
  );

router.route("/getUploadImageSign").post(getUploadProductImageSign);
router.route("/deleteUploadImage").post(deleteProductImage);

export default router;
