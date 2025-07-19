import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function sendTestEmail() {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // send to yourself
      subject: 'Nodemailer Test Email',
      text: 'This is a test email sent from your Node.js server using nodemailer.',
    };

    const info = await transporter.sendMail(mailOptions);
    // console.log('Test email sent:', info.response);
  } catch (err) {
    console.error('Failed to send test email:', err);
  }
}

sendTestEmail(); 