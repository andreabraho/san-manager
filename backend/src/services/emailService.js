const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const send = (to, subject, html) =>
  transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });

// ── Booking emails ────────────────────────────────────────────

const sendBookingRequestToProvider = (providerEmail, booking) =>
  send(
    providerEmail,
    'New booking request',
    `<p>You have a new booking request for <strong>${booking.service.name}</strong>
     on ${booking.date} at ${booking.startTime}.</p>
     <p>Log in to approve or reject it.</p>`
  );

const sendBookingConfirmationToClient = (clientEmail, booking, status) =>
  send(
    clientEmail,
    `Your booking has been ${status}`,
    `<p>Your booking for <strong>${booking.service.name}</strong>
     on ${booking.date} at ${booking.startTime} has been <strong>${status}</strong>.</p>`
  );

const sendNewBookingNotificationToClient = (clientEmail, booking) =>
  send(
    clientEmail,
    'Booking received — pending approval',
    `<p>Your booking request for <strong>${booking.service.name}</strong>
     on ${booking.date} at ${booking.startTime} has been received and is pending approval.</p>`
  );

module.exports = {
  sendBookingRequestToProvider,
  sendBookingConfirmationToClient,
  sendNewBookingNotificationToClient,
};
