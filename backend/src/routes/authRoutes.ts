import express from 'express';
import { register } from '../controllers/authRegisterController';
import { login, me } from '../controllers/authController';
import {
  loginRateLimitMiddleware,
  registerRateLimitMiddleware,
} from '../middleware/rateLimitMiddleware';
import { jwtAuthRequired } from '../middleware/jwtAuthMiddleware';

const router = express.Router();

router.post('/register', registerRateLimitMiddleware, register);
router.post('/login', loginRateLimitMiddleware, login);
router.get('/me', jwtAuthRequired, me);

export default router;
