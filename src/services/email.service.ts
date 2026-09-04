// src/services/email.service.ts
import { Resend } from 'resend';
import emailConfig from '../config/email.config';
import { getTemplate } from './template.service';
import Notification from '../models/notification.model';
import {
  EmailEvent,
  SendNotificationEmailParams,
  NotificationStatus,
} from '../types/email.types';
import { addEmailToQueue } from '../queues/email.queue';

const resend = new Resend(emailConfig.apiKey);

interface RawEmailParams {
  to:      string;
  subject: string;
  html:    string;
}

export async function sendRawEmail(params: RawEmailParams): Promise<void> {
  const { data, error } = await resend.emails.send({
    from:    emailConfig.from,
    to:      params.to,
    subject: params.subject,
    html:    params.html,
  });

  if (error) throw new Error(error.message);
  console.log("Email sent successfully!");
console.log("Email ID:", data?.id);
}

export async function sendNotificationEmail({
  org,
  user,
  event,
  data = {},
  useQueue = true,
}: SendNotificationEmailParams & { useQueue?: boolean }): Promise<NotificationStatus> {

  const prefs = user.notificationPreferences ?? {};
  if (prefs.email === false || prefs.events?.[event] === false) {
    return 'pending'; 
  }

  const orgName = org.display_name ?? org.name;

  const { subject, html } = getTemplate(event, {
    orgName,
    userName: user.username,
    ...data,
  });

  const tenantId = org?.id ?? org?.userId;
  const userId = user?.id && String(user.id).trim() ? user.id : null;
  
  if (!tenantId) {
    throw new Error('Email service requires org with id or userId');
  }

  if (useQueue) {
    try {
      await addEmailToQueue({
        to: user.email,
        subject,
        html,
        event,
        tenantId,
        userId: userId || undefined,
        metadata: data,
      });

      await Notification.create({
        tenantId,
        user_id: userId,
        type: 'email',
        event,
        title: subject,
        body: html,
        data,
        status: 'pending',
        sent_at: null,
      });

      console.log(`[EmailService] Email queued for ${user.email} - Event: ${event}`);
      return 'pending';
    } catch (error) {
      console.error('[EmailService] Failed to queue email:', error);
    }
  }

  let status: NotificationStatus = 'sent';
  let errorMsg: string | null = null;

  try {
    await sendRawEmail({ to: user.email, subject, html });
  } catch (err) {
    status = 'failed';
    errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[EmailService] Failed to send "${event}" to ${user.email}:`, errorMsg);
  }

  await Notification.create({
    tenantId,
    user_id: userId,
    type: 'email',
    event,
    title: subject,
    body: html,
    data: { ...data, error: errorMsg },
    status,
    sent_at: status === 'sent' ? new Date() : null,
  });

  return status;
}