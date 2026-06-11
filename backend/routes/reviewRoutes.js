const express = require('express');
const { createReview, getReviewsByProduct } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:productId', protect, createReview);
router.get('/:productId', getReviewsByProduct);

module.exports = router;
