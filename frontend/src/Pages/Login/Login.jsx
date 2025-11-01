import React from 'react';
import { auth, googleProvider } from '../../firebase/firebase';
import { signInWithPopup } from 'firebase/auth';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const navigate = useNavigate(); // To handle navigation

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      localStorage.setItem("user",user.email);
      onLogin(user);
    } catch (error) {
      console.error('Error during Google login:', error);
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
      <motion.h2
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { duration: 0.3 } }}
      >
        Welcome! Please log in to continue
      </motion.h2>
      <table style={{ borderCollapse: 'collapse', marginTop: '20px' }}>
        <tbody>
          <tr>
            <td style={{ padding: '10px', textAlign: 'right' }}>
              <strong>Login Option:</strong>
            </td>
            <td style={{ padding: '10px' }}>
              <motion.button
                onClick={handleGoogleLogin}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Login with Google
              </motion.button>
            </td>
          </tr>
          <tr>
            <td colSpan="2" style={{ textAlign: 'center', paddingTop: '20px' }}>
              <motion.button
                onClick={() => navigate('/SignUp')} // Navigate to SignUp
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                }}
              >
                Don't have an account? Sign Up
              </motion.button>
            </td>
          </tr>
        </tbody>
      </table>
    </motion.div>
  );
};

export default Login;
