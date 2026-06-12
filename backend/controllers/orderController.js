import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    discountAmount,
    totalPrice,
    paymentResult
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  try {
    // 1. Verify and update stock availability for each item variant
    for (const item of orderItems) {
      const dbProduct = await Product.findById(item.product);
      if (!dbProduct) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }

      // Find matching variant
      let variantFound = false;
      for (const variant of dbProduct.variants) {
        const matchSize = !item.variant.size || variant.size === item.variant.size;
        const matchColor = !item.variant.color || variant.color === item.variant.color;
        const matchStorage = !item.variant.storage || variant.storage === item.variant.storage;
        const matchWeight = !item.variant.weight || variant.weight === item.variant.weight;

        if (matchSize && matchColor && matchStorage && matchWeight) {
          variantFound = true;
          if (variant.stockQuantity < item.qty) {
            return res.status(400).json({
              message: `Insufficient stock for ${dbProduct.name} - variant ${variant.size || ''} ${variant.color || ''}. Available: ${variant.stockQuantity}`
            });
          }
          // Decrement stock quantity
          variant.stockQuantity -= item.qty;
          break;
        }
      }

      // Fallback if no specific variants defined but main inventory checking
      if (!variantFound && dbProduct.variants.length === 0) {
        // If product has no variants, it shouldn't happen based on seed but handles safely
        return res.status(400).json({ message: `Variant mismatch for product ${dbProduct.name}` });
      }

      await dbProduct.save();
    }

    // 2. Create the order
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice: Number(itemsPrice),
      taxPrice: Number(taxPrice),
      shippingPrice: Number(shippingPrice),
      discountAmount: Number(discountAmount),
      totalPrice: Number(totalPrice),
      isPaid: paymentMethod !== 'COD', // If COD, unpaid initially. Others simulated as pre-paid.
      paidAt: paymentMethod !== 'COD' ? Date.now() : null,
      paymentResult: paymentResult || { id: 'simulated_' + Date.now(), status: 'SUCCESS', updateTime: new Date().toISOString() },
      deliveryStatus: 'Processing'
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      // Allow only the order owner or admin to view the details
      if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to paid (for COD payment capture or custom gateway returns)
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id || 'cod_paid_' + Date.now(),
        status: req.body.status || 'COMPLETED',
        updateTime: req.body.updateTime || new Date().toISOString()
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
