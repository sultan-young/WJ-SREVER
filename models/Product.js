import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: [true, 'SKU不能为空'],
    unique: true
  },
  suppliers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, '至少需要一个供应商']
  }],
  stock: {
    type: Number,
    required: [true, '库存不能为空'],
    min: [0, '库存不能为负数']
  },
  nameCN: {
    type: String,
    required: [true, '中文名称不能为空']
  },
  nameEN: String,
  images: [String],
  price: {
    type: Number,
    required: [true, '价格不能为空'],
    min: [0, '价格不能为负数']
  },
  shippingFee: {
    type: Number,
    required: [true, '运费不能为空'],
    min: [0, '运费不能为负数']
  },
  tags: [String],
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Product', productSchema);