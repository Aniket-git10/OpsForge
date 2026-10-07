import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, IUser } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { generateToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, organizationName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      sendError(res, 'An account with this email already exists', 409);
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user placeholder first
    const user = new User({
      name,
      email,
      passwordHash,
      role: 'admin', // First registered user in workspace is admin
    });

    // Create default Organization for the user
    const orgName = organizationName || `${name.split(' ')[0]}'s Workspace`;
    const slugBase = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${slugBase}-${Date.now().toString().slice(-4)}`;

    const organization = await Organization.create({
      name: orgName,
      slug,
      owner: user._id,
      members: [
        {
          user: user._id,
          role: 'admin',
          joinedAt: new Date(),
        },
      ],
    });

    // Attach organization to user
    user.organization = organization._id;
    await user.save();

    // Generate JWT
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      organization: organization._id.toString(),
    });

    res.cookie('token', token, COOKIE_OPTIONS);

    sendSuccess(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          organization: {
            id: organization._id,
            name: organization.name,
            slug: organization.slug,
          },
          preferences: user.preferences,
        },
        token,
      },
      'Registration successful',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash').populate('organization');
    if (!user) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    // Update last activity
    user.lastActiveAt = new Date();
    await user.save();

    const orgId = user.organization ? (user.organization as any)._id?.toString() : undefined;

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      organization: orgId,
    });

    res.cookie('token', token, COOKIE_OPTIONS);

    sendSuccess(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio,
          organization: user.organization,
          preferences: user.preferences,
        },
        token,
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie('token');
  sendSuccess(res, null, 'Logged out successfully');
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const user = await User.findById(req.user.id).populate('organization');
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      organization: user.organization,
      preferences: user.preferences,
      lastActiveAt: user.lastActiveAt,
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const { name, bio, avatar, preferences } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    sendSuccess(res, {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      preferences: user.preferences,
    }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Consistent timing and response for privacy
    if (!user) {
      sendSuccess(
        res,
        null,
        'If an account exists with this email, password reset instructions have been generated.'
      );
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.save();

    // In a live system, this sends an email. For portfolio/demo convenience, return resetToken in response meta
    sendSuccess(
      res,
      {
        email: user.email,
        expiresIn: '1 hour',
        // Provide token in development / demo mode so testers can directly complete the reset flow
        resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
      },
      'Password reset token generated successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      sendError(res, 'Password reset token is invalid or has expired', 400);
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    sendSuccess(res, null, 'Password reset successfully. You can now log in.');
  } catch (error) {
    next(error);
  }
};
