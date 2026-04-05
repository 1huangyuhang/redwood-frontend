import express from 'express';
import {
  getAllPricingPlans,
  getPricingPlanById,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
} from '../controllers/pricingPlanController';
import { upload } from '../config/multerConfig';

const router = express.Router();

router.get('/', getAllPricingPlans);
router.get('/:id', getPricingPlanById);
router.post('/', upload.single('image'), createPricingPlan);
router.put('/:id', upload.single('image'), updatePricingPlan);
router.delete('/:id', deletePricingPlan);

export default router;
