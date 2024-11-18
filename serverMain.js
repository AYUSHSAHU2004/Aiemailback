require('dotenv').config(); // Load environment variables

const express = require("express");
const app = express();
const cors = require('cors');
const GroupEmail = require('./Models/User');
const nodemailer = require("nodemailer");
const Queue = require('bull');
const mongoose = require('mongoose');
require("./Config/db").connect();
const Email = require('./Email'); // Import the Email model

app.use(express.json());
app.use(cors());

// Set up Redis-backed queue for email processing
const emailQueue = new Queue('emailQueue', {
    redis: {
        host: process.env.REDIS_HOST, // Use the REDIS_HOST from .env
        port: process.env.REDIS_PORT, // Use the REDIS_PORT from .env
        password: process.env.REDIS_PASS // Use the REDIS_PASS from .env
    }
});

// Function to create nodemailer transporter dynamically
const createTransporter = (emailUser, emailPass) => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });
}

// Function to send email
const sendEmail = (transporter, mailOptions) => {
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log("Error in sending email:", err);
                reject(err);
            } else {
                console.log("Email sent:", info.response);
                resolve(info.response);
            }
        });
    });
}

// Process the email queue
emailQueue.process(async (job) => {
    const { from, to, subject, text, emailUser, emailPass } = job.data;

    // Create transporter dynamically based on provided email credentials
    const transporter = createTransporter(emailUser, emailPass);

    const mailOptions = {
        from: from,
        to: to,
        subject: subject,
        text: text
    };

    try {
        const result = await sendEmail(transporter, mailOptions);
        console.log(`Email sent to ${to}: ${result}`);
    } catch (error) {
        console.error(`Failed to send email to ${to}: ${error.message}`);
        throw error; // Bull will retry based on your retry configuration
    }
});

// POST route to send email (adds email to the queue and MongoDB)
app.post("/createGroup",async(req,res)=>{
    const {email,groupName,arr} = req.body;
    try{
        const newGroupEmail = new GroupEmail({
            email: email, // Main email
            emailList: arr,
            groupName:groupName // Array of emails to be grouped
        });

        // Save the new email group to the database
        await newGroupEmail.save();

        // Return a success response
        res.status(201).json({ message: 'Group email created successfully', data: newGroupEmail });
    }catch(error){
        res.status(500).json({ error: 'Failed to add email to queue or MongoDB', message: error.message });
    }
})
app.put("/updateGroup", async (req, res) => {
    const { email, groupName, arr } = req.body; // Get email, groupName, and new email list from request body

    try {
        // Find and update the group email based on both the email and groupName
        const updatedGroupEmail = await GroupEmail.findOneAndUpdate(
            { email: email, groupName: groupName },  // Match by both email and groupName
            { $set: { emailList: arr } },            // Update the email list
            { new: true }                            // Return the updated document
        );

        // If the group email is not found, return a 404 error
        if (!updatedGroupEmail) {
            return res.status(404).json({ error: 'Group email not found' });
        }

        // Return the updated group email
        res.status(200).json({
            message: 'Group email updated successfully',
            data: updatedGroupEmail
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update group email', message: error.message });
    }
});

app.delete("/deleteGroup/:email/:groupName", async (req, res) => {
    const { email, groupName } = req.params;  // Get both email and groupName from URL parameters

    try {
        // Find and delete the group email by both the main email and group name
        const deletedGroupEmail = await GroupEmail.findOneAndDelete({ 
            email: email,
            groupName: groupName // Match both email and groupName
        });

        if (!deletedGroupEmail) {
            return res.status(404).json({ error: 'Group email not found' });
        }

        res.status(200).json({
            message: 'Group email deleted successfully',
            data: deletedGroupEmail
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete group email', message: error.message });
    }
});

app.get("/getGroup/:email", async (req, res) => {
    const { email } = req.params; // Extract email from the URL parameter

    try {
        // Find the group email document that matches the email
        const groupEmail = await GroupEmail.findOne({ email: email });

        // If the group email is not found, return a 404 error
        if (!groupEmail) {
            return res.status(404).json({ error: 'Group email not found' });
        }

        // Return the found group email
        res.status(200).json({
            message: 'Group email retrieved successfully',
            data: groupEmail
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve group email', message: error.message });
    }
});

app.post("/api/email", async (req, res) => {
    const { from, to, subject, text, emailUser, emailPass } = req.body;

    try {
        // Save email data to MongoDB before adding to the queue
        const newEmail = new Email({
            from,
            to,
            subject,
            text,
            emailUser,
            emailPass
        });

        await newEmail.save(); // Save to MongoDB

        // Add email sending job to the queue
        await emailQueue.add({ from, to, subject, text, emailUser, emailPass });

        res.status(200).json({ message: 'Email added to queue and saved to MongoDB successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add email to queue or MongoDB', message: error.message });
    }
});

// Set up an event listener for job completion
emailQueue.on('completed', (job, result) => {
    console.log(`Job completed with result: ${result}`);
});

// Set up an event listener for job failure
emailQueue.on('failed', (job, err) => {
    console.log(`Job failed with error: ${err.message}`);
});

const PORT = 3020;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
