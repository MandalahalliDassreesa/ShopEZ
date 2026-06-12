import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  size: { type: String },       // S, M, L, XL
  color: { type: String },      // Red, Black, Silver, etc.
  storage: { type: String },    // 128GB, 256GB
  weight: { type: String },     // 500g, 1kg
  priceAdjustment: { type: Number, default: 0 }, // Additional price for this variant
  stockQuantity: { type: Number, required: true, default: 0 }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: String, // Keep as Number in logic, but standard mongoose is Number
    type: Number,
    required: true
  },
  discountPercentage: {
    type: Number,
    default: 0
  },
  images: {
    type: [String],
    default: []
  },
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  features: {
    type: [String],
    default: []
  },
  variants: [variantSchema],
  tags: {
    type: [String], // 'Trending', 'Best Seller', 'Flash Sale', 'New Arrival'
    default: []
  },
  isBOGO: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

export default Product;
