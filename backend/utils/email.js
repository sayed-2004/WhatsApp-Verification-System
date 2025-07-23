const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail", // You can change this if you use another provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationEmail(toEmail, token, firstName) {
  const verificationLink = `http://localhost:3000/verify/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Verify your email for CS WhatsApp Group",
    html: `
      <p>Hi ${firstName},</p>
      <p>Thanks for signing up to join the CS WhatsApp group.</p>
      <p>Please click the link below to verify your email address and get access to the group invite:</p>
      <a href="${verificationLink}">${verificationLink}</a>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail };
