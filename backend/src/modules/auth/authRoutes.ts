import { Router } from 'express';
import { login, register, getProfile } from './authController';
import { loginValidation, registerValidation } from '../../utils/validations';
import { validateResult } from '../../utils/validateResult';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

router.post('/login', loginValidation, validateResult, login);
router.post('/register', authenticate, authorize('ADMIN'), registerValidation, validateResult, register);
router.get('/profile', authenticate, getProfile);

export default router;