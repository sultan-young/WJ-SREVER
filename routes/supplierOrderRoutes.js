import express from "express";
import { protect } from "../middlewares/auth.js";
import { ROLE } from "../constant/role.js";
import axios from "axios";
import { createOrder } from "../controllers/supplierOrderController.js";

const router = express.Router();
router
  .route("/create")
  .post(protect([ROLE.SUPER_ADMIN, ROLE.ADMIN]), createOrder);

export default router;
