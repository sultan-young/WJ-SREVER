import express from "express";
import { protect } from "../../middlewares/auth.js";
import { ROLE } from "../../constant/role.js";
import {
  getProductCategoryList,
  appendProductCategoryList,
} from "../../controllers/products/categoryController.js";

const ProductCateGoryRoute = express.Router();

ProductCateGoryRoute
  .route("/list")
  .post(protect([ROLE.SUPER_ADMIN, ROLE.ADMIN]), getProductCategoryList);

  ProductCateGoryRoute
  .route("/add")
  .post(protect([ROLE.SUPER_ADMIN, ROLE.ADMIN]), appendProductCategoryList);

export default ProductCateGoryRoute;
