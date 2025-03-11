import mongoose, { Schema } from "mongoose";

const productDetailSchema = new mongoose.Schema(
  {
    id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "商品id不能"],
    },
    count: {
      type: Number,
      required: [true, "订购数量不能为空"],
    },
    note: String,
  },
);

const SupplierOrderSchema = new mongoose.Schema(
  {
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true, "关联供应商ID不能为空"],
    },
    shippingDate: {
      type: Date,
      required: [true, "请输入预计发货时间"],
    },
    orderList: {
      type: [productDetailSchema],
    },
    // 订单备注
    note: String,
    status: {
      type: Number,
      required: true,
      enum: [
        1, // 正常
        2, // 在途
        3, // 已完成
        4, // 已删除
      ],
      default: 1, // 默认状态为正常
    },
    // 订单创建时间
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



export default mongoose.model("SupplierOrder", SupplierOrderSchema);
