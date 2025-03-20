import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  category: {type: String, required: true, unique: true},
  name: { type: String, required: true, unique: true }, // 标识不同计数器（如商品SKU）
  value: { type: Number, default: 0 },                  // 当前序列值
});

export default mongoose.model("Counter", counterSchema);
