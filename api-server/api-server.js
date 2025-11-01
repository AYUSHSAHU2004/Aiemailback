const express = require('express');
const Queue = require('bull');
const app = express();
app.use(express.json());

const emailQueue = new Queue('emailQueue', {
  redis: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
});

app.post('/api/email', async (req, res) => {
  const { from, to, subject, text } = req.body;
  try {
    await emailQueue.add({ from, to, subject, text }, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 3000 }
    });
    res.status(200).json({ message: 'Email queued' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3020, () => console.log('API listening on port 3020'));
