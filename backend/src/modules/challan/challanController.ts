import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';
import { asString } from '../../utils/validateResult';
import { Prisma, ChallanStatus } from '@prisma/client';

type ChallanWithItems = Prisma.ChallanGetPayload<{ include: { items: true } }>;
type ChallanWithRelations = Prisma.ChallanGetPayload<{
  include: {
    customer: true;
    items: true;
    creator: { select: { id: true; name: true; role: true } };
  };
}>;

const generateChallanNumber = async (): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const prefix = `CH-${dateStr}-`;

  // Find the latest challan with today's prefix
  const lastChallan = await prisma.challan.findFirst({
    where: { challanNumber: { startsWith: prefix } },
    orderBy: { challanNumber: 'desc' },
  });

  let nextNumber = 1;
  if (lastChallan) {
    const lastSeq = parseInt(lastChallan.challanNumber.split('-').pop() || '0', 10);
    nextNumber = lastSeq + 1;
  }

  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
};

export const createChallan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { customerId, items } = req.body;

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    // Fetch all products to build snapshots
    const productIds = items.map((i: any) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Check all products exist
    for (const item of items) {
      if (!productMap.has(item.productId)) {
        res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
        return;
      }
    }

    const challanNumber = await generateChallanNumber();
    const totalQuantity = items.reduce((sum: number, i: any) => sum + i.quantity, 0);

    const challan = await prisma.challan.create({
      data: {
        challanNumber,
        customerId,
        totalQuantity,
        status: 'DRAFT',
        createdBy: req.user.id,
        items: {
          create: items.map((item: any) => {
            const product = productMap.get(item.productId)!;
            return {
              productId: item.productId,
              productName: product.name,
              productSku: product.sku,
              unitPrice: product.unitPrice,
              quantity: item.quantity,
            };
          }),
        },
      },
      include: {
        customer: true,
        items: true,
        creator: { select: { id: true, name: true, role: true } },
      },
    });

    res.status(201).json({ success: true, message: 'Challan created as draft', data: challan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating challan', error: (error as Error).message });
  }
};

export const getChallans = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = asString(req.query.status);
    const search = asString(req.query.search);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { challanNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { businessName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [challans, total] = await Promise.all([
      prisma.challan.findMany({
        where,
        include: {
          customer: {
            select: { id: true, name: true, businessName: true, mobile: true },
          },
          items: true,
          creator: { select: { id: true, name: true, role: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.challan.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: challans,
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
    res.status(500).json({ success: false, message: 'Error fetching challans', error: (error as Error).message });
  }
};

export const getChallanById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
        creator: { select: { id: true, name: true, role: true, email: true } },
      },
    });

    if (!challan) {
      res.status(404).json({ success: false, message: 'Challan not found' });
      return;
    }

    res.status(200).json({ success: true, data: challan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching challan', error: (error as Error).message });
  }
};

export const updateChallan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { id } = req.params as { id: string };
    const { customerId, items, status } = req.body;

    const existing = await prisma.challan.findUnique({ where: { id }, include: { items: true } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Challan not found' });
      return;
    }

    if (existing.status !== 'DRAFT') {
      res.status(400).json({ success: false, message: 'Only draft challans can be updated' });
      return;
    }

    // Fetch products for snapshot
    const productIds = items.map((i: any) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of items) {
      if (!productMap.has(item.productId)) {
        res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
        return;
      }
    }

    const totalQuantity = items.reduce((sum: number, i: any) => sum + i.quantity, 0);

    // Delete old items and create new ones
    await prisma.challanItem.deleteMany({ where: { challanId: id } });

    const challan = await prisma.challan.update({
      where: { id },
      data: {
        customerId,
        totalQuantity,
        status: status || 'DRAFT',
        items: {
          create: items.map((item: any) => {
            const product = productMap.get(item.productId)!;
            return {
              productId: item.productId,
              productName: product.name,
              productSku: product.sku,
              unitPrice: product.unitPrice,
              quantity: item.quantity,
            };
          }),
        },
      },
      include: {
        customer: true,
        items: true,
        creator: { select: { id: true, name: true, role: true } },
      },
    });

    res.status(200).json({ success: true, message: 'Challan updated successfully', data: challan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating challan', error: (error as Error).message });
  }
};

export const confirmChallan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { id } = req.params as { id: string };

    const challan = await prisma.challan.findUnique({
      where: { id },
      include: { items: true },
    }) as ChallanWithItems | null;

    if (!challan) {
      res.status(404).json({ success: false, message: 'Challan not found' });
      return;
    }

    if (challan.status === 'CONFIRMED') {
      res.status(400).json({ success: false, message: 'Challan is already confirmed' });
      return;
    }

    if (challan.status === 'CANCELLED') {
      res.status(400).json({ success: false, message: 'Cancelled challan cannot be confirmed' });
      return;
    }

    // CRITICAL BUSINESS LOGIC: Check stock sufficiency for ALL items
    const productIds = challan.items.map((item) => item.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const insufficientItems: { product: string; available: number; required: number }[] = [];

    for (const item of challan.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        res.status(404).json({ success: false, message: 'Product no longer exists' });
        return;
      }

      if (product.currentStock < item.quantity) {
        insufficientItems.push({
          product: product.name,
          available: product.currentStock,
          required: item.quantity,
        });
      }
    }

    // If ANY item has insufficient stock, reject the entire confirmation
    if (insufficientItems.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Insufficient stock for one or more products',
        errors: insufficientItems,
      });
      return;
    }

    // All stock checks passed - reduce stock and update challan status
    const confirmedBy = req.user.id;
    const result = await prisma.$transaction(async (tx) => {
      // Reduce stock for each product
      for (const item of challan.items) {
        const product = productMap.get(item.productId)!;
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: product.currentStock - item.quantity },
        });

        // Log stock movement as OUT
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantityChanged: item.quantity,
            movementType: 'OUT',
            reason: `Challan ${challan.challanNumber}`,
            createdBy: confirmedBy,
          },
        });
      }

      // Update challan status
      return tx.challan.update({
        where: { id },
        data: { status: 'CONFIRMED' },
        include: {
          customer: true,
          items: true,
          creator: { select: { id: true, name: true, role: true } },
        },
      });
    });

    res.status(200).json({
      success: true,
      message: 'Challan confirmed and stock reduced successfully',
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error confirming challan', error: (error as Error).message });
  }
};

export const cancelChallan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { id } = req.params as { id: string };

    const challan = await prisma.challan.findUnique({
      where: { id },
      include: { items: true },
    }) as ChallanWithItems | null;

    if (!challan) {
      res.status(404).json({ success: false, message: 'Challan not found' });
      return;
    }

    if (challan.status === 'CANCELLED') {
      res.status(400).json({ success: false, message: 'Challan is already cancelled' });
      return;
    }

    // If challan was confirmed, restore stock
    if (challan.status === 'CONFIRMED') {
      for (const item of challan.items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (product) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { currentStock: product.currentStock + item.quantity },
          });

          await prisma.stockMovement.create({
            data: {
              productId: item.productId,
              quantityChanged: item.quantity,
              movementType: 'IN',
              reason: `Challan ${challan.challanNumber} cancelled - stock restored`,
              createdBy: req.user.id,
            },
          });
        }
      }
    }

    const updated = await prisma.challan.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        customer: true,
        items: true,
        creator: { select: { id: true, name: true, role: true } },
      },
    });

    res.status(200).json({
      success: true,
      message: challan.status === 'CONFIRMED'
        ? 'Challan cancelled and stock restored'
        : 'Challan cancelled',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error cancelling challan', error: (error as Error).message });
  }
};

export const getPublicStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalCustomers, totalProducts, totalChallans, confirmedChallans, draftChallans, confirmedChallansData, recentChallansData] =
      await Promise.all([
        prisma.customer.count(),
        prisma.product.count(),
        prisma.challan.count(),
        prisma.challan.count({ where: { status: ChallanStatus.CONFIRMED } }),
        prisma.challan.count({ where: { status: ChallanStatus.DRAFT } }),
        prisma.challan.findMany({
          where: { status: ChallanStatus.CONFIRMED },
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.challan.findMany({
          take: 3,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { businessName: true, name: true } },
            items: true,
          },
        }),
      ]);

    const totalRevenue = confirmedChallansData.reduce((sum, challan) => {
      const challanRevenue = challan.items.reduce((itemSum, item) => itemSum + item.unitPrice * item.quantity, 0);
      return sum + challanRevenue;
    }, 0);

    // Revenue per day for the last 12 days (drives the login graph with real data)
    const revenueByDay: { label: string; revenue: number }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const day = new Date(now);
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - i);
      const next = new Date(day);
      next.setDate(next.getDate() + 1);

      const revenue = confirmedChallansData
        .filter((c) => {
          const d = new Date(c.createdAt);
          return d >= day && d < next;
        })
        .reduce((sum, c) => sum + c.items.reduce((s, item) => s + item.unitPrice * item.quantity, 0), 0);

      revenueByDay.push({
        label: day.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        revenue,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        totalProducts,
        totalChallans,
        confirmedChallans,
        draftChallans,
        totalRevenue,
        revenueByDay,
        recentChallans: recentChallansData.map((c) => ({
          challanNumber: c.challanNumber,
          businessName: c.customer?.businessName || c.customer?.name || '—',
          amount: c.items.reduce((s, item) => s + item.unitPrice * item.quantity, 0),
          status: c.status,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching public stats', error: (error as Error).message });
  }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalCustomers, totalProducts, draftChallans, confirmedChallans, lowStockProducts, recentChallans] =
      await Promise.all([
        prisma.customer.count(),
        prisma.product.count(),
        prisma.challan.count({ where: { status: ChallanStatus.DRAFT } }),
        prisma.challan.count({ where: { status: ChallanStatus.CONFIRMED } }),
        prisma.product.count({
          where: {
            currentStock: { lte: prisma.product.fields.minStockAlert },
          },
        }),
        prisma.challan.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { name: true, businessName: true } },
            creator: { select: { name: true } },
            _count: { select: { items: true } },
          },
        }),
      ]);

    // Revenue from confirmed challans
    const confirmedChallansData = await prisma.challan.findMany({
      where: { status: ChallanStatus.CONFIRMED },
      include: { items: true },
    });

    const totalRevenue = confirmedChallansData.reduce((sum, challan) => {
      const challanRevenue = challan.items.reduce((itemSum, item) => itemSum + item.unitPrice * item.quantity, 0);
      return sum + challanRevenue;
    }, 0);

    // Customers by status
    const customersByStatus = await prisma.customer.groupBy({
      by: ['status'],
      _count: true,
    });

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        totalProducts,
        draftChallans,
        confirmedChallans,
        lowStockProducts,
        totalRevenue,
        customersByStatus,
        recentChallans,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching dashboard stats', error: (error as Error).message });
  }
};