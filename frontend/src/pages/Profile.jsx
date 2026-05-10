import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'ur');

  const getText = (urdu, english) => {
    return language === 'ur' ? urdu : english;
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
      setName(response.data.user.name);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // Fallback to localStorage if API fails
      const userData = localStorage.getItem('user');
      if (userData) {
        const localUser = JSON.parse(userData);
        setUser(localUser);
        setName(localUser.name);
      }
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/auth/update-profile`, { name }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditing(false);
      fetchUser();
      alert(getText('پروفائل اپ ڈیٹ ہوگیا!', 'Profile updated successfully!'));
    } catch (error) {
      alert(error.response?.data?.error || getText('اپ ڈیٹ میں ناکامی', 'Update failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const getTrustMessage = () => {
    const score = user?.trustScore || 0;
    if (score >= 80) return getText('بہترین! آپ قابل اعتماد ہیں', 'Excellent! You are trustworthy');
    if (score >= 60) return getText('اچھا! مزید بہتری لائیں', 'Good! Keep improving');
    if (score >= 40) return getText('ٹھیک ہے، بروقت ادائیگی کریں', 'Fair, make timely payments');
    return getText('بہتر کرنے کی ضرورت ہے', 'Needs improvement');
  };

  const styles = {
    container: { padding: '20px' },
    trustCard: {
      background: 'linear-gradient(135deg, #9b2c2c, #7b1e1e)',
      color: 'white',
      padding: '20px',
      borderRadius: '15px',
      marginBottom: '20px',
      textAlign: 'center'
    },
    trustScore: {
      fontSize: '48px',
      fontWeight: 'bold',
      margin: '10px 0'
    },
    card: {
      background: 'white',
      padding: '20px',
      borderRadius: '15px',
      marginBottom: '20px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    infoRow: {
      padding: '12px',
      background: '#f5f5f5',
      borderRadius: '10px',
      marginBottom: '10px'
    },
    input: {
      width: '100%',
      padding: '12px',
      marginBottom: '10px',
      border: '1px solid #ddd',
      borderRadius: '10px',
      fontSize: '16px',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      padding: '12px',
      background: '#9b2c2c',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold'
    },
    logoutButton: {
      width: '100%',
      padding: '12px',
      background: '#e53e3e',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold'
    }
  };

  if (!user) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>{getText('لوڈ ہو رہا ہے...', 'Loading...')}</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.trustCard}>
        <div>{getText('آپ کا بھروسہ سکور', 'Your Trust Score')}</div>
        <div style={styles.trustScore}>{user.trustScore || 0}</div>
        <div style={{ fontSize: '14px', opacity: 0.9 }}>{getTrustMessage()}</div>
      </div>
      
      <div style={styles.card}>
        <h3>{getText('پروفائل کی معلومات', 'Profile Information')}</h3>
        {!editing ? (
          <div>
            <div style={styles.infoRow}>
              <strong>{getText('نام', 'Name')}:</strong> {user.name}
            </div>
            <div style={styles.infoRow}>
              <strong>{getText('فون نمبر', 'Phone Number')}:</strong> {user.phone}
            </div>
            <div style={styles.infoRow}>
              <strong>{getText('رکنیت کی تاریخ', 'Member Since')}:</strong> {new Date(user.createdAt).toLocaleDateString()}
            </div>
            <button onClick={() => setEditing(true)} style={styles.button}>
              ✏️ {getText('ترمیم کریں', 'Edit Profile')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              required
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => setEditing(false)} style={{ flex: 1, padding: '12px', background: '#ccc', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
                {getText('منسوخ', 'Cancel')}
              </button>
              <button type="submit" disabled={loading} style={{ flex: 1, ...styles.button }}>
                {loading ? getText('محفوظ کر رہے ہیں...', 'Saving...') : getText('محفوظ کریں', 'Save')}
              </button>
            </div>
          </form>
        )}
      </div>
      
      <button onClick={handleLogout} style={styles.logoutButton}>
        🚪 {getText('لاگ آؤٹ', 'Logout')}
      </button>
    </div>
  );
}