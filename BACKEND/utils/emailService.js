import nodemailer from 'nodemailer';
import logger from './logger.js';

// Create a reusable transporter
// In production, use a real SMTP provider (Gmail, SendGrid, etc.)
// For development, we use a test account from Ethereal
let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  // If real credentials are provided and not mock, use Gmail SMTP
  if (emailUser && emailPass && !emailUser.includes('mock')) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
    logger.info('Email transporter configured with Gmail SMTP.');
  } else {
    // Create an Ethereal test account for development
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      logger.info(`Email transporter configured with Ethereal test account: ${testAccount.user}`);
    } catch (err) {
      logger.error(`Failed to create Ethereal test account: ${err.message}`);
      return null;
    }
  }

  return transporter;
};

/**
 * Send an adoption application notification email to the pet owner.
 */
export const sendAdoptionApplicationEmail = async ({ ownerEmail, ownerName, petName, applicantName, applicantEmail, applicantPhone, formData }) => {
  try {
    const mailer = await getTransporter();
    if (!mailer) {
      logger.warn('Email transporter unavailable — skipping adoption notification email.');
      return null;
    }

    const mailOptions = {
      from: `"PawSphere Adoption Portal" <${process.env.EMAIL_USER || 'noreply@pawsphere.org'}>`,
      to: ownerEmail,
      subject: `🐾 New Adoption Application for ${petName}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf9f7; border-radius: 16px; overflow: hidden; border: 1px solid #e8e0d8;">
          <div style="background: linear-gradient(135deg, #7c6df0 0%, #a78bfa 100%); padding: 32px 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🐾 PawSphere</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Adoption Application Received</p>
          </div>

          <div style="padding: 32px 24px;">
            <p style="font-size: 15px; color: #333; margin: 0 0 16px;">
              Hi <strong>${ownerName}</strong>,
            </p>
            <p style="font-size: 14px; color: #555; line-height: 1.6; margin: 0 0 24px;">
              Great news! Someone is interested in adopting <strong style="color: #7c6df0;">${petName}</strong>. Here are the applicant's details:
            </p>

            <div style="background: white; border: 1px solid #e8e0d8; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 8px 0; color: #999; font-weight: 600; width: 140px;">Applicant Name</td>
                  <td style="padding: 8px 0; color: #333; font-weight: 600;">${applicantName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #999; font-weight: 600;">Email</td>
                  <td style="padding: 8px 0; color: #333;">${applicantEmail}</td>
                </tr>
                ${applicantPhone ? `
                <tr>
                  <td style="padding: 8px 0; color: #999; font-weight: 600;">Phone</td>
                  <td style="padding: 8px 0; color: #333;">${applicantPhone}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #999; font-weight: 600;">Housing</td>
                  <td style="padding: 8px 0; color: #333;">${formData?.houseType || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #999; font-weight: 600;">Work Schedule</td>
                  <td style="padding: 8px 0; color: #333;">${formData?.workingHours || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #999; font-weight: 600;">Has Other Pets</td>
                  <td style="padding: 8px 0; color: #333;">${formData?.hasOtherPets || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #999; font-weight: 600;">Experience</td>
                  <td style="padding: 8px 0; color: #333;">${formData?.experience || 'N/A'}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 13px; color: #777; line-height: 1.6;">
              Please reach out to the applicant directly to schedule a meet-and-greet. You can respond to this email or contact them at the email/phone above.
            </p>
          </div>

          <div style="background: #f0eef5; padding: 16px 24px; text-align: center; font-size: 11px; color: #999;">
            © ${new Date().getFullYear()} PawSphere Ecosystem — Transparent Pet Rescue & Adoption
          </div>
        </div>
      `,
    };

    const info = await mailer.sendMail(mailOptions);
    logger.info(`Adoption notification email sent: ${info.messageId}`);

    // Log Ethereal preview URL in development
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info(`📧 Preview email: ${previewUrl}`);
    }

    return info;
  } catch (err) {
    logger.error(`Failed to send adoption email: ${err.message}`);
    return null;
  }
};
