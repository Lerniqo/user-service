"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = exports.sendPasswordResetEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});
const sendPasswordResetEmail = async (userEmail, token) => {
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
    const mailOptions = {
        from: `"Learniqo" <${process.env.GMAIL_USER}>`,
        to: userEmail,
        subject: "Password Reset Request",
        html: `
      <h1>Password Reset</h1>
      <p>You requested to reset your password. Click the button below to proceed:</p>
      <a href="${resetUrl}" style="background-color: #f44336; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block;">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${userEmail}`);
    }
    catch (error) {
        console.error("Error sending password reset email:", error);
    }
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendVerificationEmail = async (userEmail, token) => {
    const verificationUrl = `http://localhost:3000/verify-email?token=${token}`;
    const mailOptions = {
        from: `"Learniqo" <${process.env.GMAIL_USER}>`,
        to: userEmail,
        subject: "Verify Your Email Address",
        html: `
      <h1>Email Verification</h1>
      <p>Thank you for registering! Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block;">Verify Email</a>
      <p>If you did not create an account, please ignore this email.</p>
    `,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${userEmail}`);
    }
    catch (error) {
        console.error("Error sending verification email:", error);
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
//# sourceMappingURL=email.service.js.map