// // src/services/template.service.ts
// import { EmailEvent, EmailTemplate } from '../types/email.types';

// type TemplateBuilder = (data: Record<string, unknown>) => EmailTemplate;

// const templates: Record<EmailEvent, TemplateBuilder> = {

//   'user.invited': ({ invitedBy, orgName, acceptUrl }) => ({
//     subject: `You've been invited to ${orgName}`,
//     html: `
//       <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
//         <h2>You have been invited</h2>
//         <p><b>${invitedBy}</b> invited you to join <b>${orgName}</b>.</p>
//         <a href="${acceptUrl}"
//            style="background:#4F46E5;color:#fff;padding:10px 24px;
//                   border-radius:6px;text-decoration:none;
//                   display:inline-block;margin-top:12px;font-weight:500">
//           Accept Invitation
//         </a>
//         <p style="color:#888;font-size:12px;margin-top:20px">
//           This link expires in 48 hours.
//         </p>
//       </div>
//     `,
//   }),

//   'role.changed': ({ userName, orgName, oldRole, newRole }) => ({
//     subject: `Your role in ${orgName} has been updated`,
//     html: `
//       <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
//         <h2>Role Updated</h2>
//         <p>Hi <b>${userName}</b>,</p>
//         <p>Your role in <b>${orgName}</b> changed
//            from <b>${oldRole}</b> to <b>${newRole}</b>.</p>
//         <p>If you did not expect this, contact your administrator.</p>
//       </div>
//     `,
//   }),

//   'password.reset': ({ userName, resetUrl }) => ({
//     subject: 'Reset your password',
//     html: `
//       <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
//         <h2>Password Reset</h2>
//         <p>Hi <b>${userName}</b>,</p>
//         <p>Click below to reset your password. This link expires in 1 hour.</p>
//         <a href="${resetUrl}"
//            style="background:#4F46E5;color:#fff;padding:10px 24px;
//                   border-radius:6px;text-decoration:none;
//                   display:inline-block;margin-top:12px;font-weight:500">
//           Reset Password
//         </a>
//         <p style="color:#888;font-size:12px;margin-top:20px">
//           If you did not request this, ignore this email.
//         </p>
//       </div>
//     `,
//   }),

//   'email.verification': ({ userName, verifyUrl }) => ({
//     subject: 'Verify your email address',
//     html: `
//       <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
//         <h2>Verify your email</h2>
//         <p>Hi <b>${userName}</b>, please verify your email address.</p>
//         <a href="${verifyUrl}"
//            style="background:#4F46E5;color:#fff;padding:10px 24px;
//                   border-radius:6px;text-decoration:none;
//                   display:inline-block;margin-top:12px;font-weight:500">
//           Verify Email
//         </a>
//       </div>
//     `,
//   }),

// };

// export function getTemplate(
//   event: EmailEvent,
//   data: Record<string, unknown>
// ): EmailTemplate {
//   const builder = templates[event];

//   if (!builder) throw new Error(`No email template found for event: ${event}`);
//   return builder(data);
// }


// src/services/template.service.ts
import { EmailEvent, EmailTemplate } from '../types/email.types';

type TemplateBuilder = (data: Record<string, unknown>) => EmailTemplate;

// ─── Shared design tokens ────────────────────────────────────────────────────

const colors = {
  brand:    '#1a1a2e',
  accent:   '#7c6af7',
  accentBg: '#f7f6ff',
  text:     '#1a1a2e',
  muted:    '#444444',
  subtle:   '#999999',
  border:   '#eeeeee',
  footerBg: '#f7f6ff',
  white:    '#ffffff',
  pageBg:   '#f0eff4',
};

const font = {
  sans:  "'Helvetica Neue', Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
};

// ─── Shared partials ─────────────────────────────────────────────────────────

const logoSvg = `
  <svg width="32" height="32" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1"  width="7" height="7" rx="2" fill="${colors.white}" opacity="0.9"/>
    <rect x="10" y="1" width="7" height="7" rx="2" fill="${colors.white}" opacity="0.5"/>
    <rect x="1" y="10" width="7" height="7" rx="2" fill="${colors.white}" opacity="0.5"/>
    <rect x="10" y="10" width="7" height="7" rx="2" fill="${colors.accent}"/>
  </svg>
`;

function header(orgName: string): string {
  return `
    <tr>
      <td style="background:${colors.brand};padding:28px 40px;border-radius:12px 12px 0 0">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding-right:12px;vertical-align:middle">
              <div style="width:32px;height:32px;background:${colors.accent};
                          border-radius:8px;display:inline-flex;align-items:center;
                          justify-content:center">
                ${logoSvg}
              </div>
            </td>
            <td style="vertical-align:middle;
                       font-family:${font.sans};font-size:15px;font-weight:500;
                       letter-spacing:0.02em;color:${colors.white}">
              ${orgName}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

function footer(): string {
  return `
    <tr>
      <td style="background:${colors.footerBg};padding:20px 40px;
                 border-radius:0 0 12px 12px;
                 font-family:${font.sans};font-size:12px;color:${colors.subtle};
                 line-height:1.6">
        You're receiving this email because an action was taken on your account.
        &nbsp;·&nbsp; <a href="#" style="color:${colors.subtle}">Unsubscribe</a>
        &nbsp;·&nbsp; <a href="#" style="color:${colors.subtle}">Privacy Policy</a>
      </td>
    </tr>
  `;
}

function eyebrow(label: string): string {
  return `
    <p style="margin:0 0 12px;font-family:${font.sans};font-size:11px;
              font-weight:600;letter-spacing:0.12em;text-transform:uppercase;
              color:${colors.accent}">
      ${label}
    </p>
  `;
}

function headline(text: string): string {
  return `
    <h1 style="margin:0 0 20px;font-family:${font.serif};font-size:26px;
               font-weight:400;line-height:1.25;color:${colors.text}">
      ${text}
    </h1>
  `;
}

function paragraph(text: string): string {
  return `
    <p style="margin:0 0 16px;font-family:${font.sans};font-size:15px;
              line-height:1.7;color:${colors.muted}">
      ${text}
    </p>
  `;
}

function ctaButton(label: string, url: string): string {
  return `
    <a href="${url}"
       style="display:inline-block;background:${colors.accent};color:${colors.white};
              padding:12px 28px;border-radius:8px;text-decoration:none;
              font-family:${font.sans};font-size:14px;font-weight:600;
              letter-spacing:0.01em;margin:8px 0 24px">
      ${label}
    </a>
  `;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid ${colors.border};margin:24px 0">`;
}

function note(text: string): string {
  return `
    <p style="margin:0;font-family:${font.sans};font-size:12px;
              line-height:1.6;color:${colors.subtle}">
      ${text}
    </p>
  `;
}

function roleChangedBox(oldRole: string, newRole: string): string {
  return `
    <div style="background:${colors.accentBg};border-left:3px solid ${colors.accent};
                border-radius:0 8px 8px 0;padding:14px 18px;margin:16px 0 24px">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="font-family:${font.sans}">
            <div style="font-size:12px;color:${colors.subtle};margin-bottom:2px">
              Previous role
            </div>
            <div style="font-size:14px;font-weight:500;color:${colors.text}">
              ${oldRole}
            </div>
          </td>
          <td style="font-size:18px;color:${colors.accent};text-align:center;
                     width:40px">
            &rarr;
          </td>
          <td style="font-family:${font.sans};text-align:right">
            <div style="font-size:12px;color:${colors.subtle};margin-bottom:2px">
              New role
            </div>
            <div style="font-size:14px;font-weight:500;color:${colors.text}">
              ${newRole}
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function credentialsBox(email: string, password: string): string {
  return `
    <div style="background:${colors.accentBg};border:1px solid ${colors.border};
                border-radius:8px;padding:20px 24px;margin:20px 0 28px">
      <p style="margin:0 0 14px;font-family:${font.sans};font-size:11px;font-weight:600;
                letter-spacing:0.1em;text-transform:uppercase;color:${colors.subtle}">
        Your sign-in credentials
      </p>
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="padding-bottom:10px">
            <div style="font-family:${font.sans};font-size:12px;color:${colors.subtle};
                        margin-bottom:3px">Email address</div>
            <div style="font-family:${font.sans};font-size:15px;font-weight:500;
                        color:${colors.text}">${email}</div>
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid ${colors.border};padding-top:10px">
            <div style="font-family:${font.sans};font-size:12px;color:${colors.subtle};
                        margin-bottom:3px">Temporary password</div>
            <div style="font-family:'Courier New',Courier,monospace;font-size:15px;
                        font-weight:600;color:${colors.accent};letter-spacing:0.06em">
              ${password}
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;
}

// ─── Base layout wrapper ──────────────────────────────────────────────────────

function baseLayout(orgName: string, bodyContent: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Email</title>
    </head>
    <body style="margin:0;padding:0;background:${colors.pageBg};">
      <table cellpadding="0" cellspacing="0" border="0" width="100%"
             style="background:${colors.pageBg};padding:40px 16px;min-height:100vh">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" border="0"
                   width="560" style="max-width:560px;width:100%;
                                      background:${colors.white};
                                      border-radius:12px">
              ${header(orgName)}
              <tr>
                <td style="padding:40px 40px 32px">
                  ${bodyContent}
                </td>
              </tr>
              ${footer()}
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `.trim();
}

// ─── Templates ────────────────────────────────────────────────────────────────

const templates: Record<EmailEvent, TemplateBuilder> = {

  'user.invited': ({ orgName, userEmail, tempPassword, signInUrl }) => ({
    subject: `You've been added to ${orgName}`,
    html: baseLayout(String(orgName), `
      ${eyebrow('Welcome')}
      ${headline(`Your account on ${orgName} is ready`)}
      ${paragraph(`A new account has been created for you on <strong>${orgName}</strong>. Use the credentials below to sign in for the first time.`)}
      ${credentialsBox(String(userEmail), String(tempPassword))}
      ${ctaButton('Sign In to Your Account', String(signInUrl))}
      ${divider()}
      ${note('You will be prompted to change your password after your first sign-in. Keep these credentials safe and do not share them.')}
    `),
  }),

  'role.changed': ({ userName, orgName, oldRole, newRole }) => ({
    subject: `Your role in ${orgName} has been updated`,
    html: baseLayout(String(orgName), `
      ${eyebrow('Role Update')}
      ${headline('Your role has been updated')}
      ${paragraph(`Hi <strong>${userName}</strong>, an administrator has made a change to your role in <strong>${orgName}</strong>.`)}
      ${roleChangedBox(String(oldRole), String(newRole))}
      ${note('If you did not expect this change, please contact your workspace administrator immediately.')}
    `),
  }),

  'password.reset': ({ userName, resetUrl }) => ({
    subject: 'Reset your password',
    html: baseLayout('Account Security', `
      ${eyebrow('Security')}
      ${headline('Reset your password')}
      ${paragraph(`Hi <strong>${userName}</strong>, we received a request to reset the password on your account. Click below to open the password reset page.`)}
      ${ctaButton('Choose a New Password', String(resetUrl))}
      ${divider()}
      ${note('This link expires in <strong>1 hour</strong> and can only be used once. If you did not request this, your password has not changed — you can safely ignore this email.')}
    `),
  }),

  'email.verification': ({ userName, verifyUrl }) => ({
    subject: 'Verify your email address',
    html: baseLayout('Welcome', `
      ${eyebrow('Verification')}
      ${headline('Confirm your email address')}
      ${paragraph(`Hi <strong>${userName}</strong>, thanks for signing up. Just one more step — confirm your email address to activate your account.`)}
      ${ctaButton('Verify Email', String(verifyUrl))}
      ${divider()}
      ${note("If you didn't create an account, you can safely ignore this email.")}
    `),
  }),

};

// ─── Public API ───────────────────────────────────────────────────────────────

export function getTemplate(
  event: EmailEvent,
  data: Record<string, unknown>,
): EmailTemplate {
  const builder = templates[event];
  if (!builder) throw new Error(`No email template found for event: ${event}`);
  return builder(data);
}