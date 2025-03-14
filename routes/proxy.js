import express from "express";
import { protect } from "../middlewares/auth.js";
import { ROLE } from "../constant/role.js";
import axios from "axios";

const router = express.Router();
router
  .route("/exportImg")
  .post(protect([ROLE.SUPER_ADMIN, ROLE.ADMIN]), async (req, res) => {
    try {
      const { imageUrls } = req.body;
      if (!imageUrls || !Array.isArray(imageUrls)) {
        return res.error(400, "入参错误");
      }

      const filterImageUrls = imageUrls.filter(item => item)
      // 并行请求所有图片（任一失败立即终止）
      const responses = await Promise.all(
        filterImageUrls.map((url) =>
          axios.get(url, {
            responseType: "arraybuffer",
            timeout: 5000, // 超时控制（可选）
          })
        )
      );

      // 转换为 Base64 格式
      const imagesData = responses.map((response, index) => {
        const base64 = Buffer.from(response.data, "binary").toString("base64");
        return [filterImageUrls[index], `data:${response.headers["content-type"]};base64,${base64}`]
      });

      res.success(imagesData);
    } catch (error) {
        res.error('处理失败请重试', 500)
    }
  });

export default router;
