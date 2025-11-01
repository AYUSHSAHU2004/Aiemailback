const express = require('express');
const EmailGroup = require('./models/EmailGroup');
require('./db'); // connect to MongoDB

const Queue = require('bull');
const cors = require('cors');
const app = express();

app.use(cors());        app.use(express.json());

const emailQueue = new Queue('emailQueue', {
  redis: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
});

app.get('/api/groups/:groupName/emails', async (req, res) => {
  const { groupName } = req.params;

  try {
    const group = await EmailGroup.findOne({ groupName });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.json({ emails: group.emails });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/groups', async (req, res) => {
  const { groupName, emails } = req.body;
  if (!groupName || !Array.isArray(emails)) {
    return res.status(400).json({ error: 'Group name and emails array are required' });
  }

  try {
    const group = new EmailGroup({ groupName, emails });
    await group.save();
    res.status(201).json({ message: 'Group created', group });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Group name already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get all group names
app.get('/api/groups', async (req, res) => {
  try {
    const groups = await EmailGroup.find({}, 'groupName -_id');
    const groupNames = groups.map(g => g.groupName);
    res.json({ groups: groupNames });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



app.post('/api/email', async (req, res) => {
  const { to, subject, text, emailUser, emailPass } = req.body;

  if (!emailUser || !emailPass) {
    return res.status(400).json({ error: "Email credentials required" });
  }

  try {
    await emailQueue.add({
      from: emailUser,        // use emailUser as from
      to,
      subject,
      text,
      emailUser,
      emailPass,
    }, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 3000 },
    });

    res.status(200).json({ message: 'Email queued for sending' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to queue email', message: error.message });
  }
});

const PORT = process.env.PORT || 3020;
app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
