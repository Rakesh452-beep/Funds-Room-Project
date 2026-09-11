import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  logStockMovement,
  getStockMovements,
  getLowStockProducts,
} from './productController';
import { productValidation, stockMovementValidation, paginationValidation } from '../../utils/validations';
import { validateResult } from '../../utils/validateResult';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'WAREHOUSE'), productValidation, validateResult, createProduct);
router.get('/', paginationValidation, validateResult, getProducts);
router.get('/low-stock', getLowStockProducts);
router.get('/stock-movements', getStockMovements);
router.get('/:id', getProductById);
router.put('/:id', authorize('ADMIN', 'WAREHOUSE'), productValidation, validateResult, updateProduct);
router.post('/:id/stock', authorize('ADMIN', 'WAREHOUSE'), stockMovementValidation, validateResult, logStockMovement);

export default router;