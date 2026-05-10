import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get token from localStorage
  const getToken = () => {
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token); // Debug log
    return token;
  };

  useEffect(() => {
    // Get user from localStorage first
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchCommittees();
  }, []);

  const fetchCommittees = async () => {
    const token = getToken();
    if (!token) {
      console.log('No token found, redirecting to login');
      window.location.href = '/';
      return;
    }

    try {
      console.log('Fetching committees with token...');
      const response = await axios.get(`${API_URL}/committees`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Committees fetched:', response.data);
      setCommittees(response.data);
    } catch (error) {
      console.error('Failed to fetch committees:', error);
      if (error.response?.status === 401) {
        console.log('Token invalid, redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } finally {
      setLoading(false);
    }
  };

  // Language helper
  const getText = (urdu, english) => {
    const language = localStorage.getItem('language') || 'ur';
    return language === 'ur' ? urdu : english;
  };

  // Rest of your component remains the same...
  const styles = {
    container: { padding: '20px' },
    welcomeCard: {
      background: 'linear-gradient(135deg, #9b2c2c, #7b1e1e)',
      color: 'white',
      padding: '20px',
      borderRadius: '15px',
      marginBottom: '20px'
    },
    trustScore: {
      fontSize: '48px',
      fontWeight: 'bold',
      margin: '10px 0'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '15px',
      marginBottom: '20px'
    },
    statCard: {
      background: 'white',
      padding: '15px',
      borderRadius: '15px',
      textAlign: 'center',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    statNumber: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#9b2c2c'
    },
    section: {
      background: 'white',
      padding: '20px',
      borderRadius: '15px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    committeeCard: {
      background: '#f9f9f9',
      padding: '15px',
      borderRadius: '10px',
      marginTop: '10px'
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>{getText('لوڈ ہو رہا ہے...', 'Loading...')}</div>;
  }

  const stats = {
    totalCommittees: committees.length,
    totalMembers: committees.reduce((sum, c) => sum + (c.members?.length || 0), 0)
  };

  return (
    <div style={styles.container}>
      <div style={styles.welcomeCard}>
        <h2>{getText('خوش آمدید', 'Welcome')}, {user?.name || getText('بہن', 'Sister')}! 👋</h2>
        <div style={{ marginTop: '15px' }}>
          <div>{getText('آپ کا بھروسہ سکور', 'Your Trust Score')}</div>
          <div style={styles.trustScore}>{user?.trustScore || 0}</div>
        </div>
      </div>
      
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.totalCommittees}</div>
          <div>{getText('کمیٹیاں', 'Committees')}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>0</div>
          <div>{getText('ادائیگیاں', 'Payments')}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.totalMembers}</div>
          <div>{getText('ممبرز', 'Members')}</div>
        </div>
      </div>
      
      <div style={styles.section}>
        <h3>{getText('میری کمیٹیاں', 'My Committees')}</h3>
        {committees.length > 0 ? (
          committees.map(committee => (
            <div key={committee._id} style={styles.committeeCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{getText(committee.nameUr, committee.name)}</strong>
                <span style={{ color: '#9b2c2c' }}>Rs. {committee.monthlyAmount}</span>
              </div>
              <div>{getText('ممبرز', 'Members')}: {committee.members?.length || 0}/{committee.totalMembers}</div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            {getText('کوئی کمیٹی نہیں۔ پہلی کمیٹی بنائیں!', 'No committees yet. Create your first committee!')}
          </div>
        )}
      </div>
    </div>
  );
}