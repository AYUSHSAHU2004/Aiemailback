import React, { useState } from 'react';

export default function CreateGroup() {
  const [groupName, setGroupName] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState([]);
  const [responseMsg, setResponseMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const addEmail = () => {
    const email = emailInput.trim();
    if (email && !emails.includes(email)) {
      setEmails([...emails, email]);
      setEmailInput('');
    }
  };

  const removeEmail = (emailToRemove) => {
    setEmails(emails.filter(e => e !== emailToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponseMsg('');
    if (!groupName) {
      setResponseMsg('Group name is required');
      return;
    }
    if (emails.length === 0) {
      setResponseMsg('At least one email required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3020/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupName, emails }),
      });
      const data = await res.json();
      if (res.ok) {
        setResponseMsg('Group created successfully');
        setGroupName('');
        setEmails([]);
        setEmailInput('');
      } else {
        setResponseMsg(data.error || 'Failed to create group');
      }
    } catch (error) {
      setResponseMsg('Error: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', fontFamily: 'Arial, sans-serif', marginTop: 40 }}>
      <h2>Create Email Group</h2>
      <form onSubmit={handleSubmit}>
        <label>Group Name:</label><br />
        <input
          type="text"
          value={groupName}
          onChange={e => setGroupName(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 15 }}
          required
        />

        <label>Add Email:</label><br />
        <div style={{ display: 'flex', marginBottom: 10 }}>
          <input
            type="email"
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
            style={{ flex: 1, padding: 8 }}
            placeholder="Enter email and click Add"
          />
          <button type="button" onClick={addEmail} style={{ marginLeft: 10 }}>
            Add
          </button>
        </div>

        {emails.length > 0 &&
          <div style={{ marginBottom: 15 }}>
            <p>Emails in group:</p>
            <ul style={{ paddingLeft: 20 }}>
              {emails.map(email => (
                <li key={email} style={{ marginBottom: 5 }}>
                  {email}{' '}
                  <button type="button" onClick={() => removeEmail(email)} style={{ color: 'red', cursor: 'pointer' }}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        }

        <button type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
          {loading ? 'Creating...' : 'Create Group'}
        </button>
      </form>
      {responseMsg && <p style={{ marginTop: 15 }}>{responseMsg}</p>}
    </div>
  );
}
