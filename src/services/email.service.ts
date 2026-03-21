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
}: SendNotificationEmailParams): Promise<NotificationStatus> {

  // Check notification preferences
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

  let status: NotificationStatus = 'sent';
  let errorMsg: string | null    = null;

  try {
    await sendRawEmail({ to: user.email, subject, html });
  } catch (err) {
    status   = 'failed';
    errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[EmailService] Failed to send "${event}" to ${user.email}:`, errorMsg);
  }

  // Always log — even failures need a record
  const tenantId = org?.id ?? org?.userId;
  const userId = user?.id && String(user.id).trim() ? user.id : null;
  if (!tenantId) {
    throw new Error('Email service requires org with id or userId');
  }

  await Notification.create({
    tenantId,
    user_id: userId,
    type:    'email',
    event,
    title:   subject,
    body:    html,
    data:    { ...data, error: errorMsg },
    status,
    sent_at: status === 'sent' ? new Date() : null,
  });

  return status;
}