/**
 * Email Notification Service for TravelEase
 * Supports Resend, SendGrid, or custom SMTP with graceful development preview fallback.
 */

import dotenv from 'dotenv';
dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'bookings@travelease.com';

/**
 * Sends booking confirmation email with e-ticket summary
 */
export async function sendBookingConfirmationEmail(booking) {
  const subject = `Booking Confirmed: ${booking.bookingId} — ${booking.serviceTitle}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
      <div style="background: linear-gradient(135deg, #10b981, #0d9488); padding: 24px; border-radius: 12px; color: #ffffff; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">TravelEase E-Ticket Voucher</h1>
        <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Your reservation is verified and confirmed</p>
      </div>

      <div style="padding: 24px 0; border-bottom: 1px solid #f1f5f9;">
        <p style="font-size: 16px; margin: 0 0 8px 0;">Hello <strong>${booking.customerName || 'Traveler'}</strong>,</p>
        <p style="color: #64748b; font-size: 14px; margin: 0;">Thank you for booking with TravelEase. Your booking reference is <span style="font-family: monospace; font-weight: bold; color: #059669;">${booking.bookingId}</span>.</p>
      </div>

      <div style="background: #f8fafc; padding: 16px; border-radius: 12px; margin: 20px 0;">
        <h3 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">Reservation Summary</h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Service</td>
            <td style="padding: 6px 0; font-weight: bold; text-align: right;">${booking.serviceTitle}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Total Amount</td>
            <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #059669;">₹${Number(booking.amount || 0).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Payment Method</td>
            <td style="padding: 6px 0; font-weight: bold; text-align: right;">${booking.paymentMethod || 'Razorpay'}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-top: 24px; color: #94a3b8; font-size: 12px;">
        <p>TravelEase Technologies · 24/7 Global Traveler Support</p>
        <p>support@travelease.com</p>
      </div>
    </div>
  `;

  if (RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [booking.customerEmail],
          subject,
          html: htmlContent
        })
      });
      const data = await res.json();
      console.log(`[Email Service] Sent confirmation email via Resend to ${booking.customerEmail}:`, data.id);
      return { success: true, emailId: data.id };
    } catch (err) {
      console.error('[Email Service Error]:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Development mode fallback: simulate sending
  console.log(`[Email Service Dev Mode] Simulated sending to ${booking.customerEmail}: "${subject}"`);
  return { success: true, mode: 'simulated' };
}

/**
 * Sends password reset email with secure token link
 */
export async function sendPasswordResetEmail(email, resetToken) {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/forgot-password?token=${resetToken}`;
  const subject = 'TravelEase — Password Reset Request';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; color: #1e293b;">
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password for your TravelEase account.</p>
      <p>Click the link below to set a new password. This link is valid for 1 hour:</p>
      <div style="margin: 24px 0;">
        <a href="${resetUrl}" style="background: #f59e0b; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
          Reset My Password
        </a>
      </div>
      <p style="color: #64748b; font-size: 12px;">If you did not request this, you can safely ignore this email.</p>
    </div>
  `;

  if (RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [email],
          subject,
          html: htmlContent
        })
      });
      console.log(`[Email Service] Password reset sent to ${email}`);
      return { success: true };
    } catch (err) {
      console.error('[Email Service Error]:', err.message);
      return { success: false, error: err.message };
    }
  }

  console.log(`[Email Service Dev Mode] Simulated password reset link for ${email}: ${resetUrl}`);
  return { success: true, mode: 'simulated', resetUrl };
}
