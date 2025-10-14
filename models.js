const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String },
  isAdmin: { type: Boolean, default: false }, // Added admin flag
  createdAt: { type: Date, default: Date.now }
});

const BookSchema = new mongoose.Schema({
  type: { type: String, enum: ['custom', 'pre-made'], required: true },
  title: { type: String, required: true },
  assets: {
    images: [String],
    voice: String
  },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  downloadPath: { type: String },
  customData: { type: Object },
  status: { type: String, enum: ['pending', 'processing', 'completed'], default: 'pending' },
  orderDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const CartSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    bookID: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    quantity: { type: Number, default: 1 },
    addedAt: { type: Date, default: Date.now }
  }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  Book: mongoose.model('Book', BookSchema),
  Cart: mongoose.model('Cart', CartSchema)
};