import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';
import { asString } from '../../utils/validateResult';

export const createCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const {
      name,
      mobile,
      email,
      businessName,
      gstNumber,
      customerType,
      address,
      status,
      followUpDate,
    } = req.body;

    // Check if mobile or email already exists
    const existing = await prisma.customer.findFirst({
      where: { OR: [{ mobile }, { email }] },
    });
    if (existing) {
      res.status(400).json({ success: false, message: 'Customer with this mobile or email already exists' });
      return;
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        mobile,
        email,
        businessName,
        gstNumber: gstNumber || null,
        customerType,
        address,
        status: status || 'LEAD',
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        createdBy: req.user.id,
      },
    });

    res.status(201).json({ success: true, message: 'Customer created successfully', data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating customer', error: (error as Error).message });
  }
};

export const getCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = asString(req.query.search);
    const customerType = asString(req.query.customerType);
    const status = asString(req.query.status);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { gstNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (customerType) where.customerType = customerType;
    if (status) where.status = status;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: { select: { followUps: true, challans: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: customers,
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
    res.status(500).json({ success: false, message: 'Error fetching customers', error: (error as Error).message });
  }
};

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        followUps: {
          include: { creator: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'desc' },
        },
        challans: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching customer', error: (error as Error).message });
  }
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    const {
      name,
      mobile,
      email,
      businessName,
      gstNumber,
      customerType,
      address,
      status,
      followUpDate,
    } = req.body;

    // Check if mobile/email conflicts with another customer
    const conflict = await prisma.customer.findFirst({
      where: {
        id: { not: id },
        OR: [{ mobile }, { email }],
      },
    });
    if (conflict) {
      res.status(400).json({ success: false, message: 'Customer with this mobile or email already exists' });
      return;
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        mobile,
        email,
        businessName,
        gstNumber: gstNumber || null,
        customerType,
        address,
        status,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      },
    });

    res.status(200).json({ success: true, message: 'Customer updated successfully', data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating customer', error: (error as Error).message });
  }
};

export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    await prisma.customer.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting customer', error: (error as Error).message });
  }
};

export const addFollowUp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { id } = req.params as { id: string };
    const { note } = req.body;

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    const followUp = await prisma.followUp.create({
      data: {
        note,
        customerId: id,
        createdBy: req.user.id,
      },
      include: {
        creator: { select: { id: true, name: true, role: true } },
      },
    });

    res.status(201).json({ success: true, message: 'Follow-up added successfully', data: followUp });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding follow-up', error: (error as Error).message });
  }
};