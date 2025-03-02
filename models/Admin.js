import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '请输入管理员账号'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, '请输入密码'],
    minlength: 6,
  },
  name: {
    type: String,
    required: [true, '请输入管理员姓名'],
  },
  phone: {
    type: String,
    required: [true, '请输入管理员联系方式'],
  },
  role: {
    type: Number,
    required: [true, '未分配权限'],
  }
});

adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('Admin', adminSchema);