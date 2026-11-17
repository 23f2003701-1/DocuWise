import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/responseHelper';

const generateToken = (userId: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error('JWT_SECRET not configured');
  return jwt.sign({ userId }, jwtSecret, {
    expiresIn: '7d',
  });
};

// POST /api/auth/register
export const register = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, 400, 'Validation failed', errors.array());
      return;
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      sendError(res, 400, 'User with this email already exists');
      return;
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Generate token
    const token = generateToken((user._id as unknown as string).toString());

    sendSuccess(res, 201, 'User registered successfully', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        notificationPreferences: user.notificationPreferences,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    sendError(res, 500, 'Registration failed', error);
  }
};

// POST /api/auth/login
export const login = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, 400, 'Validation failed', errors.array());
      return;
    }

    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      sendError(res, 401, 'Invalid email or password');
      return;
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      sendError(res, 401, 'Invalid email or password');
      return;
    }

    // Generate token
    const token = generateToken((user._id as unknown as string).toString());

    sendSuccess(res, 200, 'Login successful', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        notificationPreferences: user.notificationPreferences,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    sendError(res, 500, 'Login failed', error);
  }
};

// GET /api/auth/me
export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user!;
    sendSuccess(res, 200, 'Profile fetched successfully', {
      id: user._id,
      name: user.name,
      email: user.email,
      notificationPreferences: user.notificationPreferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    sendError(res, 500, 'Failed to fetch profile', error);
  }
};

// PUT /api/auth/profile
export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, 400, 'Validation failed', errors.array());
      return;
    }

    const { name, email } = req.body;
    const user = req.user!;

    // Check if email is taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        sendError(res, 400, 'Email is already taken');
        return;
      }
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    sendSuccess(res, 200, 'Profile updated successfully', {
      id: user._id,
      name: user.name,
      email: user.email,
      notificationPreferences: user.notificationPreferences,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    sendError(res, 500, 'Failed to update profile', error);
  }
};

// PUT /api/auth/change-password
export const changePassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, 400, 'Validation failed', errors.array());
      return;
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user!._id).select('+password');
    if (!user) {
      sendError(res, 404, 'User not found');
      return;
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      sendError(res, 401, 'Current password is incorrect');
      return;
    }

    user.password = newPassword;
    await user.save();

    sendSuccess(res, 200, 'Password changed successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to change password', error);
  }
};

// PUT /api/auth/push-token
export const updatePushToken = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { pushToken } = req.body;

    if (!pushToken) {
      sendError(res, 400, 'Push token is required');
      return;
    }

    const user = req.user!;
    user.pushToken = pushToken;
    await user.save();

    sendSuccess(res, 200, 'Push token updated successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to update push token', error);
  }
};
