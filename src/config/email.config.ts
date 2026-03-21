// src/config/email.config.ts
import dotenv from "dotenv";
dotenv.config();

interface EmailConfig {
  apiKey: string;
  from:   string;
  appUrl: string;
}

const emailConfig: EmailConfig = {
  apiKey: process.env.RESEND_API_KEY ?? '',
  from:   process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
  appUrl: process.env.APP_URL ?? process.env.FRONTEND_URL ?? 'http://localhost:5173',
};

if (!emailConfig.apiKey) {
  throw new Error(
    'RESEND_API_KEY is not set. Add it to your .env file. Get a free key at https://resend.com'
  );
}

export default emailConfig;