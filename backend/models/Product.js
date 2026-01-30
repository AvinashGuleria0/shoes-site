const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true }, // Stored in INR
  sizes: [{
    size: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 }
  }],
  category: { type: String, required: true },
  images: {
    front: { type: String, required: true },
    side: { type: String, required: true },
    back: { type: String, required: true },
    perspective: { type: String }
  },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
