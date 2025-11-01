const mongoose = require('mongoose');

const emailGroupSchema = new mongoose.Schema({
  groupName: { type: String, required: true, unique: true },
  emails: [{ type: String, required: true }],
}, { timestamps: true });

module.exports = mongoose.model('EmailGroup', emailGroupSchema);
