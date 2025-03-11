import mongoose, { Schema } from "mongoose";

const ImageListSchema = new Schema({
  name: {
    type: String,
    required: [true, "图片名称不能为空"],
  },
  picturebedId: {
    type: String,
    required: [true, "图床id不能为空"],
  },
  size: {
    type: Number,
  },
  uid: {
    type: String,
    required: [true, "id不能为空"],
  },
  url: {
    type: String,
    required: [true, "url不能为空"],
  },
});

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, "SKU不能为空"],
      unique: true,
    },
    shelf: {
      type: String,
      required: [true, "所属货架不能为空"],
    },
    // 商品当前的编号，用于生成sku
    index: {
      type: String,
      required: [true, ""],
    },
    suppliers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required: [true, "至少需要一个供应商"],
      },
    ],
    stock: {
      type: Number,
      required: [true, "库存不能为空"],
      min: [0, "库存不能为负数"],
    },
    nameCN: {
      type: String,
      required: [true, "中文名称不能为空"],
    },
    nameEN: String,
    images: {
      type: [ImageListSchema],
      required: [true, "至少有一张图片"],
    },
    price: {
      type: Number,
      required: [true, "价格不能为空"],
      min: [0, "价格不能为负数"],
    },
    shippingFee: {
      type: Number,
      required: [true, "运费不能为空"],
      min: [0, "运费不能为负数"],
    },
    tags: [String],
    status: {
      type: Number, // 0为正常状态, 1为删除
      require: [true]
    },
    notes: String,
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

export default mongoose.model("Product", productSchema);
