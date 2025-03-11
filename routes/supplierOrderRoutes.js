import express from "express";
import { protect } from "../middlewares/auth.js";
import { ROLE } from "../constant/role.js";
import {
  createOrder,
  getOrderList,
  deleteOrder,
  updateOrder,
  updateOrderStatus
} from "../controllers/supplierOrderController.js";

const router = express.Router();
router
  .route("/create")
  .post(protect([ROLE.SUPER_ADMIN, ROLE.ADMIN]), createOrder);

router
  .route("/list")
  .post(protect([ROLE.SUPER_ADMIN, ROLE.ADMIN]), getOrderList);

router
  .route("/delete")
  .post(protect([ROLE.SUPER_ADMIN, ROLE.ADMIN]), deleteOrder);

router
  .route("/update")
  .post(protect([ROLE.SUPER_ADMIN, ROLE.ADMIN]), updateOrder);

router
  .route("/updateStatus")
  .post(protect([ROLE.SUPER_ADMIN, ROLE.ADMIN]), updateOrderStatus);

export default router;
