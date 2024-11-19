const mongoose = require('mongoose');

// Define the Email schema
const emailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true, // Ensure the main email is provided
  },
  emailList: {
    type: [String], // Array of emails
    required: true, // Ensure the list is provided
  },
  groupName: {
    type: String,  // The name of the email group
    required: true, // Ensure the group name is provided
  }
});

// Create and export the model based on the schema
const GroupEmail = mongoose.model('GroupEmail', emailSchema);

module.exports = GroupEmail;
