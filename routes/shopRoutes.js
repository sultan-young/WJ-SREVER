import express from "express";
import { protect } from "../middlewares/auth.js";
import { ROLE } from "../constant/role.js";
import { createShop, getShopList } from "../controllers/shop/shopController.js";


const router = express.Router();
router
  .route("/create")
  .post(protect([ROLE.SUPER_ADMIN, ROLE.ADMIN]), createShop);

router
  .route("/list")
  .post(protect([ROLE.SUPER_ADMIN, ROLE.ADMIN]), getShopList);

export default router;
