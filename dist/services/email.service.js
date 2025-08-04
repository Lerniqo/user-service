"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransporter({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'vincenza.ryan@ethereal.email',
        pass: 'maDzbTu1vyycfkUakd',
    },
});
const sendVerificationEmail = async (userEmail, token) => {
    const verificationUrl = `http://localhost:3000/verify-email?token=${token}`;
    const mailOptions = {
        from: '"AI Learning Platform" <noreply@ai-learning.com>',
        to: userEmail,
        subject: 'Verify Your Email Address',
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
        console.log('Preview URL: %s', nodemailer_1.default.getTestMessageUrl(info));
    }
    catch (error) {
        console.error('Error sending verification email:', error);
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
//# sourceMappingURL=email.service.js.map