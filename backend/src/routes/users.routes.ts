import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { Permission } from '../enums/Permission';
import emailService from '../services/emailService';
import { env } from '../infrastructure/env';

const router = Router();
const prisma = new PrismaClient();

// Invite user (MUST be before POST /:id/resend-invite and GET /:id)
router.post('/invite', authenticate, requirePermission(Permission.USER_CREATE), async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, role } = req.body;
    const inviterId = req.user?.userId;

    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Get inviter info
    const inviter = await prisma.user.findUnique({
      where: { id: inviterId },
      select: { name: true }
    });

    // Create inactive user (invited state)
    const newUser = await prisma.user.create({
      data: {
        email,
        name: email.split('@')[0], // Default name from email
        role,
        passwordHash: '', // No password yet
        isActive: false, // Mark as invited
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Send invite email
    const signupLink = `${env.APP_URL}/register?invite=${newUser.id}&email=${encodeURIComponent(email)}`;
    await emailService.sendInviteEmail(
      email,
      inviter?.name || 'Admin',
      role,
      signupLink
    );

    res.status(201).json({
      success: true,
      message: 'User invited successfully',
      data: newUser,
    });
  } catch (error) {
    console.error('Failed to invite user:', error);
    res.status(500).json({ error: 'Failed to invite user' });
  }
});

// Resend invite (MUST be before GET /:id)
router.post('/:id/resend-invite', authenticate, requirePermission(Permission.USER_CREATE), async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const inviterId = req.user?.userId;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isActive) {
      return res.status(400).json({ error: 'User has already accepted the invite' });
    }

    // Get inviter info
    const inviter = await prisma.user.findUnique({
      where: { id: inviterId },
      select: { name: true }
    });

    // Send invite email
    const signupLink = `${env.APP_URL}/register?invite=${user.id}&email=${encodeURIComponent(user.email)}`;
    await emailService.sendInviteEmail(
      user.email,
      inviter?.name || 'Admin',
      user.role,
      signupLink
    );

    res.json({
      success: true,
      message: 'Invite resent successfully',
    });
  } catch (error) {
    console.error('Failed to resend invite:', error);
    res.status(500).json({ error: 'Failed to resend invite' });
  }
});

// Get all users (admin only)
router.get('/', authenticate, requirePermission(Permission.USER_VIEW), async (req: Request, res: Response): Promise<any> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const status = req.query.status as string;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role && role !== 'all') {
      where.role = role;
    }

    if (status && status !== 'all') {
      if (status === 'active') {
        where.isActive = true;
      } else if (status === 'inactive') {
        where.isActive = false;
      }
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Transform to match frontend expectations
    const transformedUsers = users.map((user) => ({
      ...user,
      status: user.isActive ? 'active' : 'inactive',
      lastLogin: undefined, // TODO: add lastLogin tracking
    }));

    res.json({
      success: true,
      data: {
        users: transformedUsers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create user (admin only)
router.post('/', authenticate, requirePermission(Permission.USER_CREATE), async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, name, role, organization, region, password } = req.body;

    // Validate required fields
    if (!email || !name || !role || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        role,
        organization,
        region,
        passwordHash,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organization: true,
        region: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser,
    });
  } catch (error) {
    console.error('Failed to create user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get single user (MUST be last)
router.get('/:id', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organization: true,
        region: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Failed to fetch user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user
router.put('/:id', authenticate, requirePermission(Permission.USER_EDIT), async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, organization, region, role, isActive } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: name ?? user.name,
        organization: organization ?? user.organization,
        region: region ?? user.region,
        role: role ?? user.role,
        isActive: isActive ?? user.isActive,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organization: true,
        region: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Failed to update user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', authenticate, requirePermission(Permission.USER_DELETE), async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (id === req.user?.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.delete({ where: { id } });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
