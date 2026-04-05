import express from 'express';
import {
  getSiteAssets,
  getSiteAssetById,
  createSiteAsset,
  createSiteAssetFromUrl,
  updateSiteAsset,
  deleteSiteAsset,
} from '../controllers/siteAssetController';
import { upload } from '../config/multerConfig';
import { uploadWriteRateLimitMiddleware } from '../middleware/rateLimitMiddleware';

const router = express.Router();

router.get('/', getSiteAssets);
router.post('/import-url', createSiteAssetFromUrl);
router.get('/:id', getSiteAssetById);
router.post(
  '/',
  uploadWriteRateLimitMiddleware,
  upload.single('image'),
  createSiteAsset
);
router.put(
  '/:id',
  uploadWriteRateLimitMiddleware,
  upload.single('image'),
  updateSiteAsset
);
router.delete('/:id', deleteSiteAsset);

export default router;
