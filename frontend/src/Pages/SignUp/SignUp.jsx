import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('https://aiemailback-3.onrender.com/createUser', {
        email,
        pass: password,
      });
      if (response.status === 201) {
        setSuccess('User created successfully!');
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      console.error('Error during user creation:', error);
      setError('Failed to create user. Please try again.');
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 50 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5 } },
  };

  const buttonVariants = {
    hover: { scale: 1.1, boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.3)' },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
        <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    border: '1px solid #f5c6cb',
                    borderRadius: '5px',
                    padding: '15px',
                    marginBottom: '20px',
                }}
            >
                <h2 style={{ margin: '0' }}>Instructions</h2>
                <p>To use this app:</p>
                <ol>
                    <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer">Google App Passwords</a>.</li>
                    <li>Set up 2-Step Verification for your Google account if you haven't already.</li>
                    <li>Create a new app password with any name (e.g., "Email App").</li>
                    <li>Use the generated app password and the email address to send emails to others.</li>
                </ol>
            </motion.div>

      <motion.h2
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { duration: 0.3 } }}
      >
        Create Your Account
      </motion.h2>
      <form
        onSubmit={handleSubmit}
        style={{
          marginTop: '20px',
          width: '100%',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            fontSize: '16px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            fontSize: '16px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />
        {error && (
          <div
            style={{
              color: 'red',
              marginBottom: '10px',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            style={{
              color: 'green',
              marginBottom: '10px',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            {success}
          </div>
        )}
        <motion.button
          type="submit"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            borderRadius: '5px',
            cursor: 'pointer',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
          }}
        >
          Sign Up
        </motion.button>
      </form>
    </motion.div>
  );
};

export default SignUp;
