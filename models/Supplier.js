import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const supplierSchema = new mongoose.Schema({
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
});

supplierSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

supplierSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("Supplier", supplierSchema);
