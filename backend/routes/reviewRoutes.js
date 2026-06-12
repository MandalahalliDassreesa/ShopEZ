import express from 'express';
import {
  createProductReview,
  getProductReviews,
  helpfulReviewVote
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/:productId')
  .post(protect, createProductReview)
  .get(getProductReviews);

router.post('/:reviewId/helpful', protect, helpfulReviewVote);

export default router;
