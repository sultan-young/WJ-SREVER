import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const supplierSchema = new mongoose.Schema(
  {
    supplierId: {
      type: String,
      required: [true, "身份不能为空"],
      minlength: 6,
      select: false,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "供应商名称不能为空"],
    },
    email: {
      type: String,
    },
    address: {
      type: String,
      required: [true, "供应商收货地址不能为空"],
    },
    phone: {
      type: Number,
    },
    role: {
      type: Number,
      required: [true, "未分配权限"],
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

supplierSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

supplierSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("Supplier", supplierSchema);
