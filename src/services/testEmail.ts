import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: "../../../user-service/.env" });  // adjust the path based on your folder structure


console.log("GMAIL_USER:", process.env.GMAIL_USER);
console.log(
  "GMAIL_APP_PASSWORD:",
  process.env.GMAIL_APP_PASSWORD ? "Loaded" : "Missing"
);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER!,
    pass: process.env.GMAIL_APP_PASSWORD!,
  },
});

transporter
  .sendMail({
    from: `"Test" <${process.env.GMAIL_USER}>`,
    to: "nirmithadharmakeerthi@gmail.com",
    subject: "Test Email",
    text: "This is a test email from Node.js",
  })
  .then((info) => console.log("✅ Email sent:", info.response))
  .catch((err) => console.error("❌ Email failed:", err));
