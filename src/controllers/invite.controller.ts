// src/controllers/invite.controller.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { sendNotificationEmail } from '../services/email.service';
import { UserInvitation } from '../models/user-invitation.model';
import emailConfig from '../config/email.config';

export async function inviteUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, role_id } = req.body as { email: string; role_id: string };
    const org   = req.org;
    const actor = req.user;
    if (!org?.id && !org?.userId) {
      res.status(400).json({ error: 'Organization context required' });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');

    const invite = await UserInvitation.create({
      tenantId: org?.id ?? org?.userId,
      email,
      role_id,
      token,
      expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000),
    });

    await sendNotificationEmail({
      org,
      user: {
        id:       '',
        email,
        username: email,
        notificationPreferences: {},
      },
      event: 'user.invited',
      data: {
        invitedBy:  (actor as { username?: string })?.username ?? 'Someone',
        acceptUrl: `${emailConfig.appUrl}/invite/accept?token=${token}`,
      },
    });

    res.status(201).json({ message: 'Invitation sent', invite });
  } catch (err) {
    next(err);
  }
}