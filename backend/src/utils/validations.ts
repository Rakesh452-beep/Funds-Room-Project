import { body, query } from 'express-validator';

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']).withMessage('Valid role is required'),
];

export const updateUserValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']).withMessage('Valid role is required'),
];

export const customerValidation = [
  body('name').trim().notEmpty().withMessage('Customer name is required'),
  body('mobile').trim().notEmpty().withMessage('Mobile number is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('businessName').trim().notEmpty().withMessage('Business name is required'),
  body('customerType').isIn(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']).withMessage('Valid customer type is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('status').optional().isIn(['LEAD', 'ACTIVE', 'INACTIVE']).withMessage('Valid status is required'),
];

export const followUpValidation = [
  body('note').trim().notEmpty().withMessage('Follow-up note is required'),
];

export const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('unitPrice').isFloat({ min: 0.01 }).withMessage('Unit price must be greater than 0'),
  body('currentStock').isInt({ min: 0 }).withMessage('Current stock must be 0 or greater'),
  body('minStockAlert').isInt({ min: 0 }).withMessage('Min stock alert must be 0 or greater'),
  body('location').trim().notEmpty().withMessage('Location is required'),
];

export const stockMovementValidation = [
  body('quantityChanged').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('movementType').isIn(['IN', 'OUT']).withMessage('Movement type must be IN or OUT'),
  body('reason').trim().notEmpty().withMessage('Reason is required'),
];

export const challanValidation = [
  body('customerId').trim().notEmpty().withMessage('Customer ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one product is required'),
  body('items.*.productId').trim().notEmpty().withMessage('Product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

export const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];
