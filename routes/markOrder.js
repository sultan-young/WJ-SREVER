import express from "express";
import { protect } from "../middlewares/auth.js";
import { ROLE } from "../constant/role.js";
import { createYwOrder } from '../controllers/markOrder/markOrderController.js'

const router = express.Router();
router
  .route("/yw")
  .post(protect([ROLE.SUPER_ADMIN, ROLE.ADMIN]), createYwOrder);

export default router;
