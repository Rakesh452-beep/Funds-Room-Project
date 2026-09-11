import { Router } from 'express';
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  addFollowUp,
} from './customerController';
import { customerValidation, followUpValidation, paginationValidation } from '../../utils/validations';
import { validateResult } from '../../utils/validateResult';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

// All routes below require authentication
router.use(authenticate);

router.post('/', authorize('ADMIN', 'SALES'), customerValidation, validateResult, createCustomer);
router.get('/', paginationValidation, validateResult, getCustomers);
router.get('/:id', getCustomerById);
router.put('/:id', authorize('ADMIN', 'SALES'), customerValidation, validateResult, updateCustomer);
router.delete('/:id', authorize('ADMIN'), deleteCustomer);
router.post('/:id/follow-ups', authorize('ADMIN', 'SALES', 'ACCOUNTS'), followUpValidation, validateResult, addFollowUp);

export default router;