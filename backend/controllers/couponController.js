import Coupon from '../models/Coupon.js';

// @desc    Apply a coupon to cart
// @route   POST /api/coupons/apply
// @access  Private
export const applyCoupon = async (req, res) => {
  const { code, cartSubtotal } = req.body;

  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon code is invalid or inactive' });
    }

    // Check expiry date
    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'Coupon code has expired' });
    }

    // Check minimum purchase
    if (cartSubtotal < coupon.minPurchase) {
      return res.status(400).json({
        message: `Minimum purchase of $${coupon.minPurchase} is required to apply this coupon`
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (cartSubtotal * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount isn't larger than subtotal
    discountAmount = Math.min(discountAmount, cartSubtotal);

    res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  const { code, discountType, discountValue, minPurchase, expiryDate } = req.body;

  try {
    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });

    if (couponExists) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minPurchase: Number(minPurchase || 0),
      expiryDate
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update coupon details
// @route   PUT /api/coupons/:id
// @access  Private/Admin
export const updateCoupon = async (req, res) => {
  const { code, discountType, discountValue, minPurchase, expiryDate, active } = req.body;

  try {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
      coupon.code = code ? code.toUpperCase() : coupon.code;
      coupon.discountType = discountType || coupon.discountType;
      coupon.discountValue = discountValue !== undefined ? Number(discountValue) : coupon.discountValue;
      coupon.minPurchase = minPurchase !== undefined ? Number(minPurchase) : coupon.minPurchase;
      coupon.expiryDate = expiryDate || coupon.expiryDate;
      coupon.active = active !== undefined ? active : coupon.active;

      const updatedCoupon = await coupon.save();
      res.json(updatedCoupon);
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
      await Coupon.deleteOne({ _id: req.params.id });
      res.json({ message: 'Coupon removed successfully' });
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
