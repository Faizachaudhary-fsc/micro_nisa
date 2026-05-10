import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function Committees() {
  const [committees, setCommittees] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [newCommittee, setNewCommittee] = useState({
    name: '',
    nameUr: '',
    monthlyAmount: 5000,
    totalMembers: 10,
    duration: 10
  });

  // Function to get Urdu/English text based on language
  const getText = (urdu, english) => {
    const language = localStorage.getItem('language') || 'ur';
    return language === 'ur' ? urdu : english;
  };

  useEffect(() => {
    fetchCommittees();
  }, []);

  const fetchCommittees = async () => {
    try {
      const response = await axios.get(`${API_URL}/committees`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCommittees(response.data);
    } catch (error) {
      console.error('Failed to fetch committees:', error);
    }
  };

  const handleCreateCommittee = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/committees`, newCommittee, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowCreate(false);
      fetchCommittees();
      alert(getText('کمیٹی کامیابی سے بن گئی!', 'Committee created successfully!'));
      
      if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance(getText('نئی کمیٹی بن گئی', 'New committee created'));
        msg.lang = 'ur-PK';
        window.speechSynthesis.speak(msg);
      }
    } catch (error) {
      alert(error.response?.data?.error || getText('کمیٹی بنانے میں ناکامی', 'Failed to create committee'));
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommittee = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/committees/join`, { inviteCode }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowJoin(false);
      setInviteCode('');
      fetchCommittees();
      alert(getText('کمیٹی میں شامل ہوگئے!', 'Joined committee successfully!'));
      
      if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance(getText('آپ کمیٹی میں شامل ہوگئے ہیں', 'You have joined the committee'));
        msg.lang = 'ur-PK';
        window.speechSynthesis.speak(msg);
      }
    } catch (error) {
      alert(error.response?.data?.error || getText('شامل ہونے میں ناکامی', 'Failed to join committee'));
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { padding: '20px' },
    buttonPrimary: {
      width: '100%',
      padding: '15px',
      background: '#9b2c2c',
      color: 'white',
      border: 'none',
      borderRadius: '15px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginBottom: '15px'
    },
    buttonSecondary: {
      width: '100%',
      padding: '15px',
      background: '#2d6a4f',
      color: 'white',
      border: 'none',
      borderRadius: '15px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginBottom: '20px'
    },
    card: {
      background: 'white',
      padding: '15px',
      borderRadius: '10px',
      marginBottom: '10px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    inviteCode: {
      background: '#f0f0f0',
      padding: '5px 10px',
      borderRadius: '5px',
      fontFamily: 'monospace',
      fontSize: '12px'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: 'white',
      padding: '20px',
      borderRadius: '15px',
      width: '90%',
      maxWidth: '400px'
    },
    input: {
      width: '100%',
      padding: '12px',
      marginBottom: '10px',
      border: '1px solid #ddd',
      borderRadius: '10px',
      fontSize: '16px',
      boxSizing: 'border-box'
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={() => setShowCreate(true)} style={styles.buttonPrimary}>
        {getText('➕ نئی کمیٹی', '➕ New Committee')}
      </button>
      
      <button onClick={() => setShowJoin(true)} style={styles.buttonSecondary}>
        {getText('🔗 کمیٹی جوائن کریں', '🔗 Join Committee')}
      </button>
      
      <h3>{getText('میری کمیٹیاں', 'My Committees')}</h3>
      {committees.map(committee => (
        <div key={committee._id} style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
              {getText(committee.nameUr, committee.name)}
            </div>
            <div style={styles.inviteCode}>
              {committee.inviteCode}
            </div>
          </div>
          <div style={{ marginBottom: '5px' }}>
            {getText('ماہانہ رقم', 'Monthly Amount')}: <strong>Rs. {committee.monthlyAmount}</strong>
          </div>
          <div style={{ marginBottom: '5px' }}>
            {getText('ممبرز', 'Members')}: {committee.members?.length || 0}/{committee.totalMembers}
          </div>
          <div>
            {getText('پیش رفت', 'Progress')}: {Math.round(((committee.currentMonth || 1) / committee.duration) * 100)}%
          </div>
        </div>
      ))}
      
      {committees.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          {getText('کوئی کمیٹی نہیں۔ پہلی کمیٹی بنائیں یا جوائن کریں', 'No committees yet. Create or join a committee')}
        </div>
      )}
      
      {/* Create Committee Modal */}
      {showCreate && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={{ marginBottom: '15px' }}>{getText('نئی کمیٹی بنائیں', 'Create New Committee')}</h3>
            <form onSubmit={handleCreateCommittee}>
              <input
                type="text"
                placeholder={getText('کمیٹی کا نام (انگریزی)', 'Committee Name (English)')}
                value={newCommittee.name}
                onChange={(e) => setNewCommittee({...newCommittee, name: e.target.value})}
                style={styles.input}
                required
              />
              <input
                type="text"
                placeholder={getText('کمیٹی کا نام (اردو)', 'Committee Name (Urdu)')}
                value={newCommittee.nameUr}
                onChange={(e) => setNewCommittee({...newCommittee, nameUr: e.target.value})}
                style={styles.input}
                required
              />
              <input
                type="number"
                placeholder={getText('ماہانہ رقم (روپے میں)', 'Monthly Amount (Rs.)')}
                value={newCommittee.monthlyAmount}
                onChange={(e) => setNewCommittee({...newCommittee, monthlyAmount: parseInt(e.target.value)})}
                style={styles.input}
                required
              />
              <input
                type="number"
                placeholder={getText('کل ممبرز', 'Total Members')}
                value={newCommittee.totalMembers}
                onChange={(e) => setNewCommittee({...newCommittee, totalMembers: parseInt(e.target.value), duration: parseInt(e.target.value)})}
                style={styles.input}
                required
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{ flex: 1, padding: '12px', background: '#ccc', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
                  {getText('منسوخ', 'Cancel')}
                </button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', background: '#9b2c2c', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
                  {loading ? getText('بنا رہے ہیں...', 'Creating...') : getText('بنائیں', 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Join Committee Modal */}
      {showJoin && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={{ marginBottom: '15px' }}>{getText('کمیٹی جوائن کریں', 'Join Committee')}</h3>
            <form onSubmit={handleJoinCommittee}>
              <input
                type="text"
                placeholder={getText('انوائٹ کوڈ درج کریں', 'Enter Invite Code')}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                style={styles.input}
                required
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="button" onClick={() => setShowJoin(false)} style={{ flex: 1, padding: '12px', background: '#ccc', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
                  {getText('منسوخ', 'Cancel')}
                </button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', background: '#2d6a4f', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
                  {loading ? getText('شامل ہو رہے ہیں...', 'Joining...') : getText('شامل ہوں', 'Join')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}