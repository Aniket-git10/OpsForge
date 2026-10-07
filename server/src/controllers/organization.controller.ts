import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { Organization } from '../models/Organization.js';
import { User, UserRole } from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logActivity } from '../services/activity.service.js';

export const getOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.organization) {
      sendError(res, 'Organization context not found', 400);
      return;
    }

    const org = await Organization.findById(req.user.organization)
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role lastActiveAt');

    if (!org) {
      sendError(res, 'Organization not found', 404);
      return;
    }

    sendSuccess(res, org);
  } catch (error) {
    next(error);
  }
};

export const addMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, role, password } = req.body;
    const orgId = req.user?.organization;

    const org = await Organization.findById(orgId);
    if (!org) {
      sendError(res, 'Organization not found', 404);
      return;
    }

    let user = await User.findOne({ email });

    if (user) {
      // Check if already member
      const isMember = org.members.some(
        (m) => m.user.toString() === user!._id.toString()
      );
      if (isMember) {
        sendError(res, 'User is already a member of this workspace', 409);
        return;
      }

      // Add to organization
      org.members.push({
        user: user._id,
        role: role as UserRole,
        joinedAt: new Date(),
      });
      user.organization = org._id;
      await user.save();
    } else {
      // Create new user account for the invited member
      const initialPassword = password || 'OpsForge123!';
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(initialPassword, salt);

      user = await User.create({
        name,
        email,
        passwordHash,
        role: role as UserRole,
        organization: org._id,
      });

      org.members.push({
        user: user._id,
        role: role as UserRole,
        joinedAt: new Date(),
      });
    }

    await org.save();

    await logActivity({
      organization: org._id,
      user: req.user!.id,
      action: 'created',
      entityType: 'member',
      details: {
        summary: `${req.user!.name || 'Admin'} added ${user.name} to workspace with role ${role}`,
      },
    });

    const updatedOrg = await Organization.findById(orgId)
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role lastActiveAt');

    sendSuccess(res, updatedOrg, 'Member added successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateMemberRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const orgId = req.user?.organization;

    const org = await Organization.findById(orgId);
    if (!org) {
      sendError(res, 'Organization not found', 404);
      return;
    }

    if (org.owner.toString() === userId && role !== 'admin') {
      sendError(res, 'Cannot change role of workspace owner away from admin', 400);
      return;
    }

    const memberIndex = org.members.findIndex((m) => m.user.toString() === userId);
    if (memberIndex === -1) {
      sendError(res, 'User is not a member of this organization', 404);
      return;
    }

    org.members[memberIndex].role = role as UserRole;
    await org.save();

    // Also update role in User document
    await User.findByIdAndUpdate(userId, { role });

    await logActivity({
      organization: org._id,
      user: req.user!.id,
      action: 'updated',
      entityType: 'member',
      details: {
        field: 'role',
        to: role,
        summary: `${req.user!.name || 'Admin'} updated member role to ${role}`,
      },
    });

    sendSuccess(res, { userId, role }, 'Member role updated successfully');
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const orgId = req.user?.organization;

    const org = await Organization.findById(orgId);
    if (!org) {
      sendError(res, 'Organization not found', 404);
      return;
    }

    if (org.owner.toString() === userId) {
      sendError(res, 'Cannot remove the organization owner', 400);
      return;
    }

    org.members = org.members.filter((m) => m.user.toString() !== userId);
    await org.save();

    await logActivity({
      organization: org._id,
      user: req.user!.id,
      action: 'deleted',
      entityType: 'member',
      details: {
        summary: `${req.user!.name || 'Admin'} removed user from workspace`,
      },
    });

    sendSuccess(res, null, 'Member removed from workspace');
  } catch (error) {
    next(error);
  }
};
