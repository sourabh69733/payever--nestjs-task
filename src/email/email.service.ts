import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    // Setup nodemailer transporter
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // or any other email service
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password',
      },
    });
  }

  async sendEmail(to: string) {
    const mailOptions = {
      from: 'your-email@gmail.com',
      to,
      subject: 'Welcome!',
      text: 'Thank you for signing up!',
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error(`Failed to send email: ${error.message}`);
    }
  }
}
