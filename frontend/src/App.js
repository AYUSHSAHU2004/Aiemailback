import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Use Navigate for redirection
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebase';
import EmailGroupSender  from './Home';
import NewGroup from './Pages/NewGroup/NewGroup';
import axios from 'axios';

const App = () => {
  const [user, setUser] = useState(null);
  const [isEmailValid, setIsEmailValid] = useState(false);


  useEffect(() => {
    // Listen for changes in the authentication state
    const unsubscribe = onAuthStateChanged(auth, async(user) => {
      if (user) {
        setUser(user); // If the user is logged in, set the user state
        try {
          const response = await axios.get(
            `http://localhost:3020/checkUser/${user.email}`
          );
          if (response.status === 200) {
            setIsEmailValid(true); // Email exists in the database
          } else {
            setIsEmailValid(false);
          }
        } catch (error) {
          console.error('Error validating email:', error);
          setIsEmailValid(false); // Email not valid
        } 
      } else {
        setUser(null); // If not, set user state to null
      }
    });
    

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element= <EmailGroupSender/> 
        />
        
        <Route
          path="/NewGroup"
          element=<NewGroup/>
        />
       
      </Routes>
    </Router>
  );
};

export default App;
