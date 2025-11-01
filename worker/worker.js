const Queue = require('bull');
const nodemailer = require('nodemailer');

const emailQueue = new Queue('emailQueue', {
  redis: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
});

emailQueue.process(async (job) => {
  const { from, to, subject, text } = job.data;

  // Ensure 'to' can be a single email or an array of emails
  const recipients = Array.isArray(to) ? to : [to];

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  for (const recipient of recipients) {
    await transporter.sendMail({ from, to: recipient, subject, text });
    console.log(`Email sent to ${recipient}`);
  }
});

console.log('Worker started');
