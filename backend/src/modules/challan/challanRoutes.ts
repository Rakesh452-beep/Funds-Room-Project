import { Router } from 'express';
import {
  createChallan,
  getChallans,
  getChallanById,
  updateChallan,
  confirmChallan,
  cancelChallan,
  getDashboardStats,
  getPublicStats,
} from './challanController';
import { challanValidation, paginationValidation } from '../../utils/validations';
import { validateResult } from '../../utils/validateResult';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

// Public: powers the login/landing page with real data (no auth required)
router.get('/public/stats', getPublicStats);

router.use(authenticate);

router.get('/dashboard/stats', getDashboardStats);
router.post('/', authorize('ADMIN', 'SALES'), challanValidation, validateResult, createChallan);
router.get('/', paginationValidation, validateResult, getChallans);
router.get('/:id', getChallanById);
router.put('/:id', authorize('ADMIN', 'SALES'), challanValidation, validateResult, updateChallan);
router.post('/:id/confirm', authorize('ADMIN', 'SALES', 'WAREHOUSE'), confirmChallan);
router.post('/:id/cancel', authorize('ADMIN', 'SALES'), cancelChallan);

export default router;