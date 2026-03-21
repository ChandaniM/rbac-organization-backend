// src/routes/notification.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { sendNotificationEmail } from '../services/email.service';
import { authenticate, fetchRequestContext } from "../middlewares/jwt.middleware";
import { EmailEvent } from '../types/email.types';

const router = Router();
router.post(
  '/test-email',
  authenticate,
  fetchRequestContext,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log("Received test email request:", req.body);
    
    if (process.env.NODE_ENV === 'production') {
      res.status(403).json({ error: 'Not available in production' });
      return;
    }
    try {
      const { event, data, to } = req.body as {
        event: EmailEvent;
        data:  Record<string, unknown>;
        to?:  string;  // recipient email — whom to send (in body)
      };
      if (!req.org || !req.user) {
        res.status(400).json({ error: 'Auth context missing (org/user)' });
        return;
      }
      const recipientEmail = to?.trim();
      if (!recipientEmail) {
        res.status(400).json({ error: 'Missing "to" in body — specify recipient email' });
        return;
      }
      const userForEmail = {
        ...(req.user as { id?: string; username?: string }),
        email: recipientEmail,
        username: (req.user as { username?: string })?.username ?? recipientEmail,
      };
      const status = await sendNotificationEmail({
        org:  req.org!,
        user: userForEmail,
        event,
        data: data ?? {},
      });
      res.json({ status });
    } catch (err) {
      next(err);
    }
  }
);

export default router;