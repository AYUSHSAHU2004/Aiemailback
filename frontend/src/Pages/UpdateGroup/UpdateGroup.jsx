import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const UpdateGroup = () => {
  const { groupName } = useParams(); // Fetching the groupName from the URL parameter
  const [groupDetails, setGroupDetails] = useState(null);
  const [userEmail, setUserEmail] = useState(null); // State to store user email
  const [updatedEmailList, setUpdatedEmailList] = useState([]); // Updated email list
  const [newGroupName, setNewGroupName] = useState(groupName); // New group name state
  const [newEmail, setNewEmail] = useState(''); // State for new email input
    const navigate = useNavigate();
  useEffect(() => {
    const storedEmail = localStorage.getItem('user');

    if (!storedEmail) {
      alert('User email is missing in localStorage!');
      return;
    }
    setUserEmail(storedEmail); // Set the email from localStorage

    const fetchGroupDetails = async () => {
      try {
        const response = await fetch(`https://aiemailback-3.onrender.com/getEmail/${storedEmail}/${groupName}`);
        if (!response.ok) {
          alert('Failed to fetch group details');
          return;
        }
        const data = await response.json();
        setGroupDetails(data); // Store the group details
        setUpdatedEmailList(data.data.emailList || []); // Initialize updatedEmailList
      } catch (error) {
        alert('Error fetching group details');
      }
    };

    if (groupName && storedEmail) {
      fetchGroupDetails();
    }
  }, [groupName]);

  const handleDeleteEmail = (emailToDelete) => {
    const filteredEmails = updatedEmailList.filter(email => email !== emailToDelete);
    setUpdatedEmailList(filteredEmails); // Update the updated email list
  };

  const handleAddEmail = () => {
    if (newEmail && !updatedEmailList.includes(newEmail)) {
      setUpdatedEmailList([...updatedEmailList, newEmail]); // Add new email to updated list
      setNewEmail(''); // Clear input
    } else {
      alert('Email is already in the list or is empty!');
    }
  };

  const handleGroupNameChange = (e) => {
    setNewGroupName(e.target.value); // Update new group name
  };

  const handleUpdateGroup = async () => {
    if (!userEmail || !groupName) {
      alert('Missing user email or group name!');
      return;
    }

    try {
      const response = await fetch(`https://aiemailback-3.onrender.com/updateGroup/${userEmail}/${groupName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newGroupName: newGroupName,
          arr: updatedEmailList,
        }),
      });

      if (response.ok) {
        alert('Group updated successfully!');
        navigate("/"); 
      } else {
        const errorData = await response.json();
        alert(`Failed to update group: ${errorData.message}`);
      }
    } catch (error) {
      alert('Error updating group:', error.message);
    }
  };

  const styles = {
    container: {
      margin: '0 auto',
      padding: '20px',
      maxWidth: '600px',
      fontFamily: 'Arial, sans-serif',
      color: '#333',
    },
    heading: {
      textAlign: 'center',
      color: '#4CAF50',
    },
    input: {
      width: '100%',
      padding: '10px',
      margin: '10px 0',
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '16px',
    },
    button: {
      backgroundColor: '#4CAF50',
      color: 'white',
      padding: '10px 15px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      marginTop: '10px',
    },
    buttonDelete: {
      backgroundColor: '#f44336',
      color: 'white',
      padding: '5px 10px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      marginLeft: '10px',
    },
    listItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '5px',
    },
    emailList: {
      listStyle: 'none',
      padding: 0,
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Update Group: {groupName}</h1>
      {userEmail ? (
        <p><strong>User Email:</strong> {userEmail}</p>
      ) : (
        <p>Loading user email...</p>
      )}

      {groupDetails ? (
        <div>
          <div>
            <label>
              <strong>Group Name:</strong>
              <input
                type="text"
                style={styles.input}
                value={newGroupName}
                onChange={handleGroupNameChange}
                placeholder="Enter new group name"
              />
            </label>
          </div>
          <h2>Email List:</h2>
          <ul style={styles.emailList}>
            {updatedEmailList.map((email, index) => (
              <li key={index} style={styles.listItem}>
                {email} 
                <button
                  style={styles.buttonDelete}
                  onClick={() => handleDeleteEmail(email)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <div>
            <label>
              <strong>Add Email:</strong>
              <input
                type="email"
                style={styles.input}
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter email to add"
              />
            </label>
            <button style={styles.button} onClick={handleAddEmail}>Add</button>
          </div>
          <div>
            <h3>Updated Email List:</h3>
            <ul style={styles.emailList}>
              {updatedEmailList.map((email, index) => (
                <li key={index} style={styles.listItem}>{email}</li>
              ))}
            </ul>
          </div>
          <button style={styles.button} onClick={handleUpdateGroup}>Update Group</button>
        </div>
      ) : (
        <p>Loading group details...</p>
      )}
    </div>
  );
};

export default UpdateGroup;
