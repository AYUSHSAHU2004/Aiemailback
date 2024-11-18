const mongoose = require('mongoose');

// Define the schema for UserCredentials
const userCredentialsSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,  // Ensure the email is unique in the collection
        lowercase: true,  // Convert email to lowercase for consistency
    },
    password: {
        type: String,
        required: true,  // Password field is required
        minlength: 6,    // You can set a minimum password length
    }
});

// Create the model using the schema
const UserCredentials = mongoose.model('UserCredentials', userCredentialsSchema);

module.exports = UserCredentials;
