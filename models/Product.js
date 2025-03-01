import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true
  },
  suppliers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  }],
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  nameCN: {
    type: String,
    required: true
  },
  nameEN: String,
  images: [String],
  price: {
    type: Number,
    required: true,
    min: 0
  },
  shippingFee: {
    type: Number,
    required: true,
    min: 0
  },
  tags: [String],
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Product', productSchema);