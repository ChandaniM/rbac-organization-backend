// src/types/email.types.ts

export type EmailEvent =
  | 'user.invited'
  | 'role.changed'
  | 'password.reset'
  | 'email.verification';

export type NotificationStatus = 'pending' | 'sent' | 'failed';
export type NotificationType   = 'email' | 'in_app' | 'push';
export type NotificationChannel = 'email' | 'in_app' | 'push';

export interface EmailTemplate {
  subject: string;
  html:    string;
}

export interface SendNotificationEmailParams {
  org:   OrgDocument;
  user:  UserDocument;
  event: EmailEvent;
  data?: Record<string, unknown>;
}

// Minimal shapes — replace with your full Mongoose doc types
export interface OrgDocument {
  id?:            string;
  userId?:        string;
  name:           string;
  display_name?:  string;
  smtpConfig?:    SmtpConfig;
}

export interface UserDocument {
  id?:         string;
  userId?:     string;
  email:       string;
  username:    string;
  notificationPreferences?: NotificationPreferences;
}

export interface NotificationPreferences {
  email?:  boolean;
  in_app?: boolean;
  push?:   boolean;
  events?: Partial<Record<EmailEvent, boolean>>;
}

export interface SmtpConfig {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  from?: string;
}