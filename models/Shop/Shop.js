import mongoose from "mongoose";

const ShopSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: [true, "请输入店铺名称"],
      unique: true,
    },
    country: {
      type: String,
      required: [true, "请选择店铺所属国家"],
    },
    countryCode: {
      type: String,
      required: [true, "请选择店铺所属国家CODE"],
    },
    shopAbbr: {
      type: String,
      required: [true, "店铺缩写"],
      unique: true,
    },
    shopType: {
      type: String,
      default: 'ETSY'
    }
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

export default mongoose.model("Shop", ShopSchema);
