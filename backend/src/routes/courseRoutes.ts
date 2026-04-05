import express from 'express';
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController';
import { upload } from '../config/multerConfig';
import { uploadWriteRateLimitMiddleware } from '../middleware/rateLimitMiddleware';

const router = express.Router();

router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.post(
  '/',
  uploadWriteRateLimitMiddleware,
  upload.single('image'),
  createCourse
);
router.put(
  '/:id',
  uploadWriteRateLimitMiddleware,
  upload.single('image'),
  updateCourse
);
router.delete('/:id', deleteCourse);

export default router;
