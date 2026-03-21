// src/controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { sendNotificationEmail } from '../services/email.service';
import { User } from '../models/user.model';
import { Role } from '../models/role.model';

export async function updateUserRole(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId, newRoleId } = req.body as {
      userId:    string;
      newRoleId: string;
    };
    const org = req.org;
    if (!org) {
      res.status(400).json({ error: 'Organization context required' });
      return;
    }

    const [user, newRole] = await Promise.all([
      User.findById(userId),
      Role.findById(newRoleId),
    ]);

    if (!user || !newRole) {
      res.status(404).json({ error: 'User or role not found' });
      return;
    }

    await sendNotificationEmail({
      org,
      user: {
        id: user._id?.toString(),
        email: user.email,
        username: user.username,
      },
      event: 'role.changed',
      data: {
        oldRole: 'None',
        newRole: newRole.name,
      },
    });

    res.json({ message: 'Role updated' });
  } catch (err) {
    next(err);
  }
}