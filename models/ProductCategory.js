import mongoose, { Schema } from "mongoose";

// 货架模型
const ProductCategorySchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, "货架名称不能为空"],
    },
    value: {
      type: String,
      unique: true,
      required: [true, "货架编号不能为空"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // 关键配置：定义 JSON 序列化时的行为
    toJSON: {
      virtuals: true, // 启用虚拟字段（可选）
      transform: (doc, ret) => {
        ret.id = ret._id.toString(); // 将 _id 的值复制给 id
        delete ret._id; // 删除 _id 字段
        delete ret.__v; // 可选：删除版本字段 __v
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export default mongoose.model("product-category", ProductCategorySchema);
