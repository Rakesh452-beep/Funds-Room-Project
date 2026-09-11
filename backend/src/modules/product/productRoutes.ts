import { Router } from 'express';
import multer from 'multer';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  logStockMovement,
  getStockMovements,
  getLowStockProducts,
  uploadProductImage,
} from './productController';
import { productValidation, stockMovementValidation, paginationValidation } from '../../utils/validations';
import { validateResult } from '../../utils/validateResult';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  },
});

router.use(authenticate);

router.post('/', authorize('ADMIN', 'WAREHOUSE'), productValidation, validateResult, createProduct);
router.get('/', paginationValidation, validateResult, getProducts);
router.get('/low-stock', getLowStockProducts);
router.get('/stock-movements', getStockMovements);
router.get('/:id', getProductById);
router.put('/:id', authorize('ADMIN', 'WAREHOUSE'), productValidation, validateResult, updateProduct);
router.post('/:id/image', authorize('ADMIN', 'WAREHOUSE'), upload.single('image'), uploadProductImage);
router.post('/:id/stock', authorize('ADMIN', 'WAREHOUSE'), stockMovementValidation, validateResult, logStockMovement);

export default router;