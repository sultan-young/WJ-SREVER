import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "请输入管理员账号"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "请输入密码"],
      minlength: 6,
    },
    name: {
      type: String,
      required: [true, "请输入管理员姓名"],
    },
    phone: {
      type: String,
      required: [true, "请输入管理员联系方式"],
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

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("Admin", adminSchema);
