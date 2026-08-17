// Email service abstraction for sending emails
// Supports SendGrid, AWS SES, and SMTP

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface PasswordResetEmailData {
  email: string;
  name: string;
  resetLink: string;
}

/**
 * Send an email using the configured email service provider
 * 
 * @param options - Email options including recipient, subject, and content
 * @returns Promise that resolves when email is sent
 * 
 * @example
 * await sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Reset Your Password',
 *   html: '<p>Click here to reset: <a href="...">Reset</a></p>',
 *   text: 'Click here to reset: ...'
 * });
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const provider = process.env.EMAIL_SERVICE_PROVIDER || 'console';

  switch (provider) {
    case 'sendgrid':
      return sendViaSendGrid(options);
    case 'ses':
      return sendViaAWSSES(options);
    case 'smtp':
      return sendViaSMTP(options);
    case 'console':
    default:
      // For development: log email to console
      console.log('=== EMAIL (Console Mode) ===');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Text:', options.text || 'N/A');
      console.log('HTML:', options.html);
      console.log('===========================');
      return Promise.resolve();
  }
}

/**
 * Send password reset email to user
 * 
 * @param data - Password reset email data
 */
export async function sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
  const { email, name, resetLink } = data;

  const html = generatePasswordResetHTML(name, resetLink);
  const text = generatePasswordResetText(name, resetLink);

  await sendEmail({
    to: email,
    subject: 'Reset Your Rakizah Password',
    html,
    text,
  });
}

/**
 * Generate HTML content for password reset email
 */
function generatePasswordResetHTML(name: string, resetLink: string): string {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>إعادة تعيين كلمة المرور</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl;">
  <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
    <h1 style="color: #4a5568; text-align: center;">إعادة تعيين كلمة المرور</h1>
    
    <div style="background-color: white; padding: 30px; border-radius: 8px; margin-top: 20px;">
      <p style="font-size: 16px;">عزيزي/عزيزتي <strong>${name}</strong>،</p>
      
      <p style="font-size: 16px;">لقد أكملنا ترحيل منصة رَكِيزَة! الرجاء إعادة تعيين كلمة المرور الخاصة بك لمواصلة استخدام المنصة.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" 
           style="background-color: #4299e1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
          إعادة تعيين كلمة المرور
        </a>
      </div>
      
      <p style="font-size: 14px; color: #666;">أو انسخ هذا الرابط والصقه في متصفحك:</p>
      <p style="font-size: 12px; color: #4299e1; word-break: break-all; background-color: #f7fafc; padding: 10px; border-radius: 4px;">
        ${resetLink}
      </p>
      
      <p style="font-size: 14px; color: #e53e3e; margin-top: 20px;">
        <strong>تنبيه:</strong> هذا الرابط سينتهي خلال 24 ساعة.
      </p>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
      
      <p style="font-size: 14px; color: #666;">
        <strong>لم تطلب إعادة تعيين كلمة المرور؟</strong><br>
        إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان. حسابك لا يزال آمناً.
      </p>
      
      <p style="font-size: 14px; color: #666;">
        <strong>تحتاج إلى مساعدة؟</strong><br>
        اتصل بنا على <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@rakizah.com'}" style="color: #4299e1;">${process.env.SUPPORT_EMAIL || 'support@rakizah.com'}</a> وسنساعدك في العودة إلى حسابك.
      </p>
    </div>
    
    <div style="text-align: center; margin-top: 30px; color: #718096; font-size: 12px;">
      <p>فريق منصة رَكِيزَة</p>
      <p>© ${new Date().getFullYear()} منصة رَكِيزَة - جميع الحقوق محفوظة</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text content for password reset email
 */
function generatePasswordResetText(name: string, resetLink: string): string {
  return `
عزيزي/عزيزتي ${name}،

لقد أكملنا ترحيل منصة رَكِيزَة! الرجاء إعادة تعيين كلمة المرور الخاصة بك لمواصلة استخدام المنصة.

إعادة تعيين كلمة المرور: ${resetLink}

تنبيه: هذا الرابط سينتهي خلال 24 ساعة.

لم تطلب إعادة تعيين كلمة المرور؟
إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان. حسابك لا يزال آمناً.

تحتاج إلى مساعدة؟
اتصل بنا على ${process.env.SUPPORT_EMAIL || 'support@rakizah.com'} وسنساعدك في العودة إلى حسابك.

فريق منصة رَكِيزَة
© ${new Date().getFullYear()} منصة رَكِيزَة - جميع الحقوق محفوظة
  `.trim();
}

/**
 * Send email via SendGrid
 */
async function sendViaSendGrid(options: EmailOptions): Promise<void> {
  try {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    await sgMail.send({
      to: options.to,
      from: {
        email: process.env.EMAIL_FROM_ADDRESS || 'noreply@rakizah.com',
        name: process.env.EMAIL_FROM_NAME || 'Rakizah Platform',
      },
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log(`Email sent via SendGrid to ${options.to}`);
  } catch (error) {
    console.error('SendGrid error:', error);
    throw new Error('Failed to send email via SendGrid');
  }
}

/**
 * Send email via AWS SES
 */
async function sendViaAWSSES(options: EmailOptions): Promise<void> {
  try {
    const AWS = require('aws-sdk');
    const ses = new AWS.SES({
      region: process.env.AWS_SES_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
    });

    const params = {
      Source: `${process.env.EMAIL_FROM_NAME || 'Rakizah Platform'} <${process.env.EMAIL_FROM_ADDRESS || 'noreply@rakizah.com'}>`,
      Destination: {
        ToAddresses: [options.to],
      },
      Message: {
        Subject: {
          Data: options.subject,
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: options.text || '',
            Charset: 'UTF-8',
          },
          Html: {
            Data: options.html,
            Charset: 'UTF-8',
          },
        },
      },
    };

    await ses.sendEmail(params).promise();
    console.log(`Email sent via AWS SES to ${options.to}`);
  } catch (error) {
    console.error('AWS SES error:', error);
    throw new Error('Failed to send email via AWS SES');
  }
}

/**
 * Send email via SMTP
 */
async function sendViaSMTP(options: EmailOptions): Promise<void> {
  try {
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Rakizah Platform'}" <${process.env.EMAIL_FROM_ADDRESS || 'noreply@rakizah.com'}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log(`Email sent via SMTP to ${options.to}`);
  } catch (error) {
    console.error('SMTP error:', error);
    throw new Error('Failed to send email via SMTP');
  }
}
