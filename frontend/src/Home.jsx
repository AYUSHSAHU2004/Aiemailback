import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function EmailGroupSender() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [groupEmails, setGroupEmails] = useState([]);
  const [formData, setFormData] = useState({
    emailUser: '',
    emailPass: '',
    to: '',       // will be overridden by groupEmails on submit
    subject: '',
    text: '',
  });
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  // Fetch groups on mount
  useEffect(() => {
    fetch('http://localhost:3020/api/groups')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.groups)) {
          setGroups(data.groups);
        }
      }).catch(console.error);
  }, []);

  // Fetch emails when a group is selected
  useEffect(() => {
    if (!selectedGroup) {
      setGroupEmails([]);
      return;
    }
    fetch(`http://localhost:3020/api/groups/${encodeURIComponent(selectedGroup)}/emails`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.emails)) {
          setGroupEmails(data.emails);
        } else {
          setGroupEmails([]);
        }
      })
      .catch(() => setGroupEmails([]));
  }, [selectedGroup]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const generateEmailContent = async (aiPrompt, language = 'English', wordCount = 150) => {
    setAiLoading(true);
    setResponseMsg('');
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Hey, Please generate an email with topic: ${aiPrompt}. The language is ${language} and the length should be approximately ${wordCount} words.`
                }
              ]
            }
          ]
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      const generatedText = response.data?.candidates?.[0]?.content || '';
      setFormData(prev => ({ ...prev, text: generatedText }));
      if (!generatedText) {
        setResponseMsg('AI did not return any content.');
      }
    } catch (error) {
      setResponseMsg('Error generating AI content: ' + (error.message || 'Unknown error'));
    }
    setAiLoading(false);
  };

  const handleGenerateClick = () => {
    const topic = prompt('Enter email topic for AI to generate:');
    if (topic) {
      generateEmailContent(topic);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponseMsg('');

    // Validate necessary fields
    if (!formData.emailUser || !formData.emailPass || !formData.subject || !formData.text) {
      setResponseMsg('Please fill all fields.');
      return;
    }
    if (groupEmails.length === 0) {
      setResponseMsg('Please select a group with emails.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3020/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Override 'to' field with selected group's emails
        body: JSON.stringify({ ...formData, to: groupEmails }),
      });
      const data = await res.json();
      if (res.ok) {
        setResponseMsg('Emails queued successfully!');
        setFormData({
          emailUser: '',
          emailPass: '',
          to: '',
          subject: '',
          text: '',
        });
        setSelectedGroup('');
        setGroupEmails([]);
      } else {
        setResponseMsg(data.error || 'Failed to queue emails.');
      }
    } catch (error) {
      setResponseMsg('Error: ' + error.message);
    }
    setLoading(false);
  };

  const containerStyle = {
    maxWidth: 450,
    margin: '40px auto',
    padding: 20,
    border: '1px solid #ccc',
    borderRadius: 8,
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
  };

  const labelStyle = { marginBottom: 6, fontWeight: 600 };

  const inputStyle = {
    width: '100%',
    padding: 10,
    marginBottom: 15,
    borderRadius: 4,
    border: '1px solid #aaa',
    fontSize: 14,
    transition: 'border-color 0.3s',
  };

  const inputFocusStyle = { borderColor: '#007bff', outline: 'none' };

  const textAreaStyle = { ...inputStyle, height: 100, resize: 'vertical' };

  const buttonStyle = {
    width: '100%',
    padding: 12,
    backgroundColor: loading || aiLoading ? '#0056b3' : '#007bff',
    color: '#fff',
    fontWeight: 700,
    border: 'none',
    borderRadius: 4,
    cursor: loading || aiLoading ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.3s, transform 0.15s',
    marginBottom: 10,
  };

  const buttonHoverStyle = { backgroundColor: '#0056b3', transform: 'scale(1.05)' };

  const responseStyle = {
    marginTop: 15,
    color: responseMsg.toLowerCase().includes('error') ? 'red' : 'green',
    textAlign: 'center',
    opacity: responseMsg ? 1 : 0,
    transition: 'opacity 0.5s ease-in',
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Send AI-Powered Email to Group</h2>

      <label style={labelStyle}>Choose Group:</label><br />
      <select
        value={selectedGroup}
        onChange={e => setSelectedGroup(e.target.value)}
        style={{...inputStyle, marginBottom: 15}}
      >
        <option value="">-- Select a Group --</option>
        {groups.map(g => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>

      {groupEmails.length > 0 && (
        <div style={{ marginBottom: 15 }}>
          <strong>Emails in Group:</strong>
          <ul style={{ paddingLeft: 20 }}>
            {groupEmails.map(email => (
              <li key={email}>{email}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {['emailUser', 'emailPass', 'subject', 'text'].map(field => {
          const isTextArea = field === 'text';
          const placeholderMap = {
            emailUser: 'your-email@gmail.com',
            emailPass: 'App Password',
            subject: 'Email subject',
            text: 'Your message here...',
          };
          const labels = {
            emailUser: 'Your Email (Sender)',
            emailPass: 'App Password',
            subject: 'Subject',
            text: 'Message',
          };
          return (
            <div key={field}>
              <label style={labelStyle} htmlFor={field}>{labels[field]}</label>
              {isTextArea ? (
                <textarea
                  id={field}
                  name={field}
                  placeholder={placeholderMap[field]}
                  style={{
                    ...textAreaStyle,
                    ...(focusedInput === field ? inputFocusStyle : {}),
                  }}
                  value={formData[field]}
                  onChange={handleChange}
                  onFocus={() => setFocusedInput(field)}
                  onBlur={() => setFocusedInput(null)}
                  required
                />
              ) : (
                <input
                  id={field}
                  name={field}
                  type={field === 'emailPass' ? 'password' : 'text'}
                  placeholder={placeholderMap[field]}
                  style={{
                    ...inputStyle,
                    ...(focusedInput === field ? inputFocusStyle : {}),
                  }}
                  value={formData[field]}
                  onChange={handleChange}
                  onFocus={() => setFocusedInput(field)}
                  onBlur={() => setFocusedInput(null)}
                  required
                />
              )}
            </div>
          );
        })}

        <button
          type="button"
          style={{ ...buttonStyle, marginBottom: 12 }}
          disabled={aiLoading || loading}
          onClick={() => {
            const topic = prompt('Enter email topic for AI to generate:');
            if (topic) generateEmailContent(topic);
          }}
          onMouseEnter={(e) => {
            if (!loading && !aiLoading) {
              e.currentTarget.style.backgroundColor = buttonHoverStyle.backgroundColor;
              e.currentTarget.style.transform = buttonHoverStyle.transform;
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && !aiLoading) {
              e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor;
              e.currentTarget.style.transform = 'none';
            }
          }}
        >
          {aiLoading ? 'Generating AI Content...' : 'Generate AI Email Content'}
        </button>

        <button
          type="submit"
          style={buttonStyle}
          disabled={loading || aiLoading}
          onMouseEnter={(e) => {
            if (!loading && !aiLoading) {
              e.currentTarget.style.backgroundColor = buttonHoverStyle.backgroundColor;
              e.currentTarget.style.transform = buttonHoverStyle.transform;
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && !aiLoading) {
              e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor;
              e.currentTarget.style.transform = 'none';
            }
          }}
        >
          {loading ? 'Sending...' : 'Send Email'}
        </button>
      </form>

      <div style={responseStyle}>{responseMsg}</div>
    </div>
  );
}
