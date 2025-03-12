import mongoose, { Schema } from "mongoose";

const EtsyProductSchema = new Schema({
  product_identifier: String,
  title: String,
  quantity: Number,
});

const EtsyOrderSchema = new mongoose.Schema(
  {
    buyer_id: Number,
    email: String,
    name: String,
    country: String,
    state: String,
    city: String,
    zip: String,
    first_line: String,
    second_line: String,
    product_identifier: String,
    title: String,
    products: [EtsyProductSchema],
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

export default mongoose.model("EtsyOrder", EtsyOrderSchema);
