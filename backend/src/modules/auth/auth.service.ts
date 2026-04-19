import bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { database as prisma } from '../../infrastructure/database';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../shared/utils/jwt';
import { encryptPhone, hashPhone } from '../../shared/utils/crypto';

const SALT_ROUNDS = 12;

export interface RegisterUserInput {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  organization?: string;
  region?: string;
}

export interface RegisterVolunteerInput {
  phone: string;
  name: string;
  language?: string;
  skills?: string[];
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginVolunteerInput {
  phone: string;
}

export class AuthService {
  /**
   * Register new admin/coordinator user
   */
  async registerUser(input: RegisterUserInput) {
    // Check if email exists
    const existing = await prisma.user.findUnique({
      where: { email: input.email }
    });
    
    if (existing) {
      throw new Error('Email already registered');
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        role: input.role,
        organization: input.organization,
        region: input.region,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organization: true,
        region: true,
        createdAt: true,
      }
    });
    
    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });
    
    const refreshToken = generateRefreshToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });
    
    return {
      user,
      accessToken,
      refreshToken,
    };
  }
  
  /**
   * Register new volunteer (phone-based)
   */
  async registerVolunteer(input: RegisterVolunteerInput) {
    // Validate phone format (basic check)
    if (!input.phone || input.phone.length < 10) {
      throw new Error('Invalid phone number');
    }
    
    // Check if phone exists
    const phoneHashValue = hashPhone(input.phone);
    const existing = await prisma.volunteer.findUnique({
      where: { phoneHash: phoneHashValue }
    });
    
    if (existing) {
      throw new Error('Phone number already registered');
    }
    
    // Create volunteer
    const volunteer = await prisma.volunteer.create({
      data: {
        phoneEncrypted: encryptPhone(input.phone),
        phoneHash: phoneHashValue,
        name: input.name,
        language: input.language || 'en',
        skills: input.skills || [],
      },
      select: {
        id: true,
        name: true,
        language: true,
        skills: true,
        createdAt: true,
      }
    });
    
    return volunteer;
  }
  
  /**
   * Login admin/coordinator user
   */
  async loginUser(input: LoginInput) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email }
    });
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Verify password
    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    
    if (!isValid) {
      throw new Error('Invalid email or password');
    }
    
    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }
    
    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });
    
    const refreshToken = generateRefreshToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization,
        region: user.region,
      },
      accessToken,
      refreshToken,
    };
  }
  
  /**
   * Login volunteer (phone-based, no password)
   */
  async loginVolunteer(input: LoginVolunteerInput) {
    const phoneHashValue = hashPhone(input.phone);
    
    const volunteer = await prisma.volunteer.findUnique({
      where: { phoneHash: phoneHashValue }
    });
    
    if (!volunteer) {
      throw new Error('Phone number not registered');
    }
    
    if (!volunteer.isActive) {
      throw new Error('Volunteer account is inactive');
    }
    
    // For phone-based auth, we use access tokens with longer expiry
    const accessToken = generateAccessToken({
      userId: volunteer.id,
      role: UserRole.VOLUNTEER,
    });
    
    return {
      volunteer: {
        id: volunteer.id,
        name: volunteer.name,
        language: volunteer.language,
        skills: volunteer.skills,
      },
      accessToken,
    };
  }
  
  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      
      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: payload.userId }
      });
      
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }
      
      // Generate new access token
      const accessToken = generateAccessToken({
        userId: user.id,
        role: user.role,
        email: user.email,
      });
      
      return { accessToken };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }
  
  /**
   * Get current user profile
   */
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organization: true,
        region: true,
        createdAt: true,
      }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }
  
  /**
   * Get current volunteer profile
   */
  async getCurrentVolunteer(volunteerId: string) {
    const volunteer = await prisma.volunteer.findUnique({
      where: { id: volunteerId },
      select: {
        id: true,
        name: true,
        language: true,
        skills: true,
        availabilityRadiusKm: true,
        currentLat: true,
        currentLng: true,
        burnoutScore: true,
        lastCheckin: true,
        createdAt: true,
      }
    });
    
    if (!volunteer) {
      throw new Error('Volunteer not found');
    }
    
    return volunteer;
  }
}

export default new AuthService();
