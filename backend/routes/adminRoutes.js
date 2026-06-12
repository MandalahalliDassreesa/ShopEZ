import express from 'express';
import {
  getUsers,
  blockUser,
  unblockUser,
  getOrders,
  updateOrderDeliveryStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  getAnalyticsDashboard
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes here require admin access and login protection
router.use(protect, admin);

router.get('/users', getUsers);
router.put('/users/:id/block', blockUser);
router.put('/users/:id/unblock', unblockUser);

router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderDeliveryStatus);

router.post('/products', createProduct);
router.route('/products/:id')
  .put(updateProduct)
  .delete(deleteProduct);

router.get('/analytics', getAnalyticsDashboard);

export default router;
