import { validationResult, ValidationError } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateResult = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e: ValidationError) => ({
        field: e.type === 'field' ? e.path : e.type,
        message: e.msg,
      })),
    });
    return;
  }
  next();
};

export const asString = (value: unknown): string => {
  if (Array.isArray(value)) return value[0] || '';
  return typeof value === 'string' ? value : value ? String(value) : '';
};