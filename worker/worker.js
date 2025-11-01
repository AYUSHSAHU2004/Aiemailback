const Queue = require('bull');
const nodemailer = require('nodemailer');

const emailQueue = new Queue('emailQueue', {
  redis: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
});

emailQueue.process(async (job) => {
  const { from, to, subject, text, emailUser, emailPass } = job.data;

  if (!emailUser || !emailPass) {
    throw new Error('Email credentials missing in job data');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: emailUser, pass: emailPass }
  });

  await transporter.sendMail({ from, to, subject, text });
  console.log(`Email sent to ${to} from ${from}`);
});

console.log('Worker started');
