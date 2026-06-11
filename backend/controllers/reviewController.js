const Review = require('../models/Review');

exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.create({
      product: req.params.productId,
      user: req.user.id,
      rating,
      comment,
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getReviewsByProduct = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate('user', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
