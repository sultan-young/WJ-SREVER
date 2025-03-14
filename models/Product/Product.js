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
    category: {
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
    nameCn: {
      type: String,
      required: [true, "中文名称不能为空"],
    },
    nameEn: {
      type: String,
      required: [true, "英文名称不能为空"],
    },
    images: {
      type: [ImageListSchema],
      required: [true, "至少有一张图片"],
    },
    costPriceRMB: { // 当只有一个价格时候取取去这个值
      type: Number,
      required: [true, "商品成本价格不能为空"],
      min: [0, "价格不能为负数"],
      default: 0,
    },
    priceLinkSuppliers: {
      type: Number,
      enum: [0, 1], // 0不关联， 1关联
      require: [true, '商品价格是否关联手工艺人'],
      default: 0,
    },
    costSuppliersLinkPricesRMB: {
      type: [Object], // {id: 手工艺人id，prices: 价格}
    },
    salePriceUSD: {
      type: Number,
      required: [true, "平台销售价格不能为空"],
      min: [0, "价格不能为负数"],
    },
    saleShipPriceUSD: {
      type: Number,
      required: [true, "商品收取的运费不能为空"],
      min: [0, "价格不能为负数"],
    },
    shippingFeeRMB: {
      type: Number,
      required: [true, "国内运送到目的国运费不能为空"],
      min: [0, "运费不能为负数"],
    },
    declaredPrice: {
      type: Number,
      required: [true, "商品申报价格不能为空"],
      min: [0, "商品申报价格不能为空"],
    },
    listingLink: {
      type: String,
      required: [true, "商品链接不能为空"],
    },
    tags: [String],
    notes: String,
    status: {
      type: Number, // 0为正常状态, 1为删除
      require: [true],
    },
    hasVariant: {
      type: Number,
      require: [true],
      enum: [0, 1], // 0无变体，1有变体
    },
    variantSerial: {
      type: String, // 变体的编号，会追加到sku最后
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    groupID: {
      type: mongoose.Schema.Types.ObjectId,
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

export default mongoose.model("Product", productSchema);
