import express from 'express';
import {
  getProducts,
  getProductById,
  getProductRecommendations,
  getProductCategories,
  getProductBrands
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/meta/categories', getProductCategories);
router.get('/meta/brands', getProductBrands);
router.get('/:id', getProductById);
router.get('/:id/recommendations', getProductRecommendations);

export default router;
