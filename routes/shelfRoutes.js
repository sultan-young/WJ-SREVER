import express from "express";
import { protect } from "../middlewares/auth.js";
import { ROLE } from "../constant/role.js";
import {
  appendShelfList,
  getShelfList,
} from "../controllers/shelfController.js";

const router = express.Router();

router
  .route("/list")
  .post(protect([ROLE.SUPER_ADMIN, ROLE.ADMIN]), getShelfList);

router
  .route("/add")
  .post(protect([ROLE.SUPER_ADMIN, ROLE.ADMIN]), appendShelfList);
export default router;
