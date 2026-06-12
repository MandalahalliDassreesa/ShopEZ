import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Create new review
// @route   POST /api/reviews/:productId
// @access  Private
export const createProductReview = async (req, res) => {
  const { rating, comment, images } = req.body;
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({
      product: productId,
      user: req.user._id
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed by this user' });
    }

    // Verify purchase: check if user has a completed order containing this product
    const userOrders = await Order.find({
      user: req.user._id,
      isPaid: true,
      deliveryStatus: 'Delivered',
      'orderItems.product': productId
    });
    
    const verifiedPurchase = userOrders.length > 0;

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      userName: req.user.name,
      rating: Number(rating),
      comment,
      images: images || [],
      verifiedPurchase
    });

    // Update Product average rating and numReviews
    const reviews = await Review.find({ product: productId });
    product.numReviews = reviews.length;
    product.rating =
      reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await product.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upvote review helpfulness
// @route   POST /api/reviews/:reviewId/helpful
// @access  Private
export const helpfulReviewVote = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user already voted
    const alreadyVoted = review.votedUsers.includes(req.user._id);

    if (alreadyVoted) {
      // Toggle vote (remove vote)
      review.votedUsers = review.votedUsers.filter(
        (userId) => userId.toString() !== req.user._id.toString()
      );
      review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
    } else {
      // Add vote
      review.votedUsers.push(req.user._id);
      review.helpfulVotes += 1;
    }

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
