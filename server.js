require('dotenv').config(); // Load environment variables

const express = require("express");
const app = express();
const UserCredential = require('./Models/Nuser.jsx');
const cors = require('cors');
const GroupEmail = require('./Models/User.jsx');
const nodemailer = require("nodemailer");
const mongoose = require('mongoose');
require("./Config/db.jsx").connect();

app.use(express.json());
app.use(cors());

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

// POST route to send email (adds email to MongoDB)
app.post("/createGroup", async (req, res) => {
    const { email, groupName, emailList } = req.body;

    try {
        // Check if a group with the same email and groupName already exists
        const existingGroup = await GroupEmail.findOne({ email,groupName });

        if (existingGroup) {
            // If a group with the same email and groupName already exists, return an error
            return res.status(400).json({ error: 'Group with the same email and group name already exists' });
        }

        // If the groupName exists but with a different email, allow creating the group
        // No need for an additional check here as we only care about the combination of email and groupName
        const newGroupEmail = new GroupEmail({
            email: email,  // Main email
            emailList: emailList,  // Email list including the main email and additional emails
            groupName: groupName  // Group name
        });

        // Save the new group to the database
        await newGroupEmail.save();
        res.status(201).json({ message: 'Group created successfully', data: newGroupEmail });

    } catch (error) {
        res.status(500).json({ error: 'Failed to create group', message: error.message });
    }
});

app.post("/createUser", async (req, res) => {
    const { email, pass} = req.body;
    try {
        const UserEmail = new UserCredential({
            email: email, // Main email
            password:pass // Array of emails to be grouped
        });

        // Save the new email group to the database
        await UserEmail.save();

        // Return a success response
        res.status(201).json({ message: 'User created successfully', data: UserEmail });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add email to MongoDB', message: error.message });
    }
});

// PUT route to update a group email
app.put("/updateGroup/:email/:groupName", async (req, res) => {
    const { arr, newGroupName } = req.body; // Get the email, groupName, new email list, and new group name from the request body

    try {
        // Find the group email and update both the email list and group name
        const updatedGroupEmail = await GroupEmail.findOneAndUpdate(
            { email: req.params.email, groupName: req.params.groupName },  // Match by both email and groupName from URL params
            { 
                $set: { 
                    emailList: arr,              // Update the email list
                    groupName: newGroupName      // Update the group name if provided
                }
            },
            { new: true }  // Return the updated document
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


// DELETE route to delete a group email
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

// GET route to retrieve a group email by email
app.get("/getGroup/:email", async (req, res) => {
    const { email } = req.params; // Extract email from the URL parameter

    try {
        // Find the group email document that matches the email
        const groupEmail = await GroupEmail.find({ email: email});

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


app.delete("/deleteGroup/:email/:groupName",async(req,res)=>{
    const {email , groupName} = req.params;
    try{
        const groupEmail = await GroupEmail.find({ email: email,groupName:groupName});


    }catch(err){
        res.status(500).json("error deleting group",err);
    }
})

app.get("/getEmail/:email/:groupName", async (req, res) => {
    const { email, groupName } = req.params; // Extract email and userName from the URL parameters

    try {
        // Find the group email document that matches both email and userName
        const groupEmail = await GroupEmail.findOne({ email: email, groupName: groupName });

        // If the group email is not found, return a 404 error
        if (!groupEmail) {
            return res.status(404).json({ error: 'Group not found' });
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


app.get("/checkUser/:email", async (req, res) => {
    const { email } = req.params; // Extract email from the URL parameter

    try {
        // Find the email document that matches the email
        const currEmail = await UserCredential.findOne({ email: email });

        // If the email is not found, return a 404 error
        if (!currEmail) {
            return res.status(404).json({ error: 'Email not found' });
        }

        // Return the found email
        res.status(200).json({
            message: 'Email retrieved successfully',
            data: currEmail
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve email', message: error.message });
    }
});


// POST route to send email (directly sends email without queue)
app.post("/api/email", async (req, res) => {
    const { from, to, subject, text, emailUser, emailPass } = req.body;

    try {
        // Create transporter and send the email directly
        const transporter = createTransporter(emailUser, emailPass);
        const mailOptions = {
            from,
            to,
            subject,
            text
        };

        await sendEmail(transporter, mailOptions); // Send the email

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send email', message: error.message });
    }
});

const PORT = 3020;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
