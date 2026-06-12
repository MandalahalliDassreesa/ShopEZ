import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Block user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
export const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot block administrative users' });
    }

    user.blocked = true;
    await user.save();
    res.json({ message: 'User blocked successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unblock user
// @route   PUT /api/admin/users/:id/unblock
// @access  Private/Admin
export const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.blocked = false;
    await user.save();
    res.json({ message: 'User unblocked successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order delivery status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderDeliveryStatus = async (req, res) => {
  const { status } = req.body; // Processing, Packed, Shipped, Out for Delivery, Delivered

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.deliveryStatus = status;
      if (status === 'Delivered') {
        order.isPaid = true; // In case of COD, delivery implies payment
        order.deliveredAt = Date.now();
        if (!order.paidAt) {
          order.paidAt = Date.now();
        }
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/admin/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  const { name, description, brand, category, price, discountPercentage, images, features, variants, tags, isBOGO } = req.body;

  try {
    const product = new Product({
      name,
      description,
      brand,
      category,
      price: Number(price),
      discountPercentage: Number(discountPercentage || 0),
      images: images || [],
      features: features || [],
      variants: variants || [],
      tags: tags || [],
      isBOGO: isBOGO || false
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  const { name, description, brand, category, price, discountPercentage, images, features, variants, tags, isBOGO } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.brand = brand || product.brand;
      product.category = category || product.category;
      product.price = price !== undefined ? Number(price) : product.price;
      product.discountPercentage = discountPercentage !== undefined ? Number(discountPercentage) : product.discountPercentage;
      product.images = images || product.images;
      product.features = features || product.features;
      product.variants = variants || product.variants;
      product.tags = tags || product.tags;
      product.isBOGO = isBOGO !== undefined ? isBOGO : product.isBOGO;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: req.params.id });
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get sales analytics and general dashboard stats
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalyticsDashboard = async (req, res) => {
  try {
    // 1. Total revenue & orders count
    const totalOrders = await Order.countDocuments({});
    const salesData = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = salesData[0] ? salesData[0].totalRevenue : 0;

    // 2. Monthly sales trend (over last 6 months)
    const monthlySales = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          sales: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    // 3. Category revenue performance
    const categoryPerformance = await Order.aggregate([
      { $match: { isPaid: true } },
      { $unwind: '$orderItems' },
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$productDetails.category',
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } },
          unitsSold: { $sum: '$orderItems.qty' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // 4. Customer growth (Users created monthly)
    const customerGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          newCustomers: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    // 5. Popular products by purchase counts
    const topProducts = await Order.aggregate([
      { $match: { isPaid: true } },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          name: { $first: '$orderItems.name' },
          unitsSold: { $sum: '$orderItems.qty' },
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } }
        }
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 }
    ]);

    // 6. Inventory health alerts
    const allProducts = await Product.find({});
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const inventoryList = [];

    allProducts.forEach(product => {
      let productTotalStock = 0;
      product.variants.forEach(v => {
        productTotalStock += v.stockQuantity;
      });

      if (productTotalStock === 0) {
        outOfStockCount++;
      } else if (productTotalStock < 10) {
        lowStockCount++;
      }

      inventoryList.push({
        _id: product._id,
        name: product.name,
        category: product.category,
        totalStock: productTotalStock,
        status: productTotalStock === 0 ? 'Out of Stock' : productTotalStock < 10 ? 'Low Stock' : 'Healthy'
      });
    });

    res.json({
      totalRevenue,
      totalOrders,
      totalCustomers: await User.countDocuments({ role: 'customer' }),
      monthlySales,
      categoryPerformance,
      customerGrowth,
      topProducts,
      inventorySummary: {
        totalProducts: allProducts.length,
        lowStockCount,
        outOfStockCount
      },
      inventoryList: inventoryList.slice(0, 15) // send top 15 for dashboard lists
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
