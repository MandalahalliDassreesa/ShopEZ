const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config();

const products = [
  {
    name: 'Wireless Headphones',
    description: 'High-fidelity wireless headphones with noise cancellation.',
    price: 119.99,
    category: 'Electronics',
    stock: 15,
    images: ['https://via.placeholder.com/600x400?text=Headphones'],
  },
  {
    name: 'Smart Watch',
    description: 'Track fitness, notifications, and health metrics on the go.',
    price: 89.99,
    category: 'Wearables',
    stock: 22,
    images: ['https://via.placeholder.com/600x400?text=Smart+Watch'],
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight running shoes with responsive cushioning.',
    price: 74.99,
    category: 'Footwear',
    stock: 30,
    images: ['https://via.placeholder.com/600x400?text=Shoes'],
  },
  {
    name: 'Travel Backpack',
    description: 'Durable backpack with multiple compartments and laptop sleeve.',
    price: 54.99,
    category: 'Accessories',
    stock: 18,
    images: ['https://via.placeholder.com/600x400?text=Backpack'],
  },
];

const users = [
  {
    name: 'Admin User',
    email: 'admin@shopez.com',
    password: '$2a$10$K7CqGJwNWuBVYj0JMk2Jae8WkJKFMZPF7hA/1gZm0S55wy/6uDkk6',
    address: '123 Admin Street',
    role: 'admin',
  },
  {
    name: 'Sample Buyer',
    email: 'buyer@shopez.com',
    password: '$2a$10$K7CqGJwNWuBVYj0JMk2Jae8WkJKFMZPF7hA/1gZm0S55wy/6uDkk6',
    address: '456 Customer Ave',
    role: 'customer',
  },
];

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopez';

mongoose.connect(MONGO_URI)
  .then(async () => {
    await Product.deleteMany();
    await User.deleteMany();
    await Product.insertMany(products);
    await User.insertMany(users);
    console.log('Seed data inserted successfully');
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error(err);
    mongoose.disconnect();
  });
