import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';
import { asString } from '../../utils/validateResult';

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { name, sku, category, unitPrice, currentStock, minStockAlert, location } = req.body;

    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) {
      res.status(400).json({ success: false, message: 'Product with this SKU already exists' });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        category,
        unitPrice,
        currentStock: currentStock || 0,
        minStockAlert: minStockAlert || 10,
        location,
        createdBy: req.user.id,
      },
    });

    // Log initial stock movement if stock was set
    if (currentStock && currentStock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          quantityChanged: currentStock,
          movementType: 'IN',
          reason: 'Initial stock setup',
          createdBy: req.user.id,
        },
      });
    }

    res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating product', error: (error as Error).message });
  }
};

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = asString(req.query.search);
    const category = asString(req.query.category);
    const lowStock = asString(req.query.lowStock) === 'true';
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) where.category = category;

    const whereCount = { ...where };
    if (lowStock) {
      where.currentStock = { lte: prisma.product.fields.minStockAlert };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          _count: { select: { stockMovements: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where: lowStock ? where : whereCount }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching products', error: (error as Error).message });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          include: { creator: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching product', error: (error as Error).message });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { id } = req.params as { id: string };
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const { name, sku, category, unitPrice, minStockAlert, location } = req.body;

    const conflict = await prisma.product.findFirst({
      where: { id: { not: id }, sku },
    });
    if (conflict) {
      res.status(400).json({ success: false, message: 'Product with this SKU already exists' });
      return;
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        sku,
        category,
        unitPrice,
        minStockAlert,
        location,
      },
    });

    res.status(200).json({ success: true, message: 'Product updated successfully', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating product', error: (error as Error).message });
  }
};

export const logStockMovement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { id } = req.params as { id: string };
    const { quantityChanged, movementType, reason } = req.body;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // Validate stock for OUT movement
    if (movementType === 'OUT' && product.currentStock < quantityChanged) {
      res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.currentStock}, Requested: ${quantityChanged}`,
      });
      return;
    }

    const newStock = movementType === 'IN'
      ? product.currentStock + quantityChanged
      : product.currentStock - quantityChanged;

    const [updatedProduct, movement] = await prisma.$transaction([
      prisma.product.update({
        where: { id },
        data: { currentStock: newStock },
      }),
      prisma.stockMovement.create({
        data: {
          productId: id,
          quantityChanged,
          movementType,
          reason,
          createdBy: req.user.id,
        },
        include: {
          creator: { select: { id: true, name: true } },
        },
      }),
    ]);

    res.status(201).json({
      success: true,
      message: 'Stock movement logged successfully',
      data: { product: updatedProduct, movement },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error logging stock movement', error: (error as Error).message });
  }
};

export const getStockMovements = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const movementType = asString(req.query.movementType);
    const productId = asString(req.query.productId);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (movementType) where.movementType = movementType;
    if (productId) where.productId = productId;

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, sku: true } },
          creator: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.stockMovement.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: movements,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching stock movements', error: (error as Error).message });
  }
};

export const getLowStockProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      where: {
        currentStock: {
          lte: prisma.product.fields.minStockAlert,
        },
      },
      orderBy: { currentStock: 'asc' },
    });

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching low stock products', error: (error as Error).message });
  }
};