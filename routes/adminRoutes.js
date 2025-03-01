import express from 'express';
import { protect } from '../middlewares/auth.js';
import { createAdmin, getAllAdmins } from '../controllers/adminController.js';

const router = express.Router();

router.use(protect(['admin']));

router.route('/')
  .post(createAdmin)
  .get(getAllAdmins);

export default router;