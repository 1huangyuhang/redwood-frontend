import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { upload } from '../config/multerConfig';
import { uploadWriteRateLimitMiddleware } from '../middleware/rateLimitMiddleware';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post(
  '/',
  uploadWriteRateLimitMiddleware,
  upload.single('image'),
  createProduct
);
router.put(
  '/:id',
  uploadWriteRateLimitMiddleware,
  upload.single('image'),
  updateProduct
);
router.delete('/:id', deleteProduct);

export default router;
