import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function Payments() {
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const getText = (urdu, english) => {
    const language = localStorage.getItem('language') || 'ur';
    return language === 'ur' ? urdu : english;
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
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
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (committeeId, month) => {
    try {
      await axios.post(`${API_URL}/committees/${committeeId}/pay`, { month }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert(getText('ادائیگی کامیابی سے ریکارڈ ہوگئی!', 'Payment recorded successfully!'));
      fetchCommittees();
      
      if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance(getText('آپ کی ادائیگی موصول ہوگئی', 'Your payment has been received'));
        msg.lang = 'ur-PK';
        window.speechSynthesis.speak(msg);
      }
    } catch (error) {
      alert(error.response?.data?.error || getText('ادائیگی ریکارڈ کرنے میں ناکامی', 'Failed to record payment'));
    }
  };

  const styles = {
    container: { padding: '20px' },
    card: {
      background: 'white',
      padding: '15px',
      borderRadius: '10px',
      marginBottom: '15px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    statusPending: {
      background: '#fed7d7',
      color: '#e53e3e',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    button: {
      width: '100%',
      padding: '10px',
      background: '#9b2c2c',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      marginTop: '10px',
      cursor: 'pointer'
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>{getText('لوڈ ہو رہا ہے...', 'Loading...')}</div>;
  }

  const allPayments = [];
  committees.forEach(committee => {
    const userPayments = committee.payments?.filter(p => p.userId === user?.id) || [];
    userPayments.forEach(payment => {
      allPayments.push({
        ...payment,
        committeeName: committee.name,
        committeeNameUr: committee.nameUr,
        committeeId: committee._id
      });
    });
  });

  const pendingPayments = allPayments.filter(p => p.status === 'pending');

  return (
    <div style={styles.container}>
      <h3>{getText('ادائیگی ڈیش بورڈ', 'Payment Dashboard')}</h3>
      
      {pendingPayments.length > 0 && (
        <div>
          <h4>{getText('زیر التواء ادائیگیاں', 'Pending Payments')} ({pendingPayments.length})</h4>
          {pendingPayments.map((payment, idx) => (
            <div key={idx} style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <strong>{getText(payment.committeeNameUr, payment.committeeName)}</strong>
                <span style={styles.statusPending}>{getText('زیر التواء', 'Pending')}</span>
              </div>
              <div>{getText('قسط نمبر', 'Installment')}: {payment.month}</div>
              <div>{getText('رقم', 'Amount')}: Rs. {payment.amount}</div>
              <div>{getText('آخری تاریخ', 'Due Date')}: {new Date(payment.dueDate).toLocaleDateString()}</div>
              <button onClick={() => handlePayment(payment.committeeId, payment.month)} style={styles.button}>
                {getText('ادائیگی کریں', 'Pay Now')}
              </button>
            </div>
          ))}
        </div>
      )}
      
      {pendingPayments.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          {getText('کوئی زیر التواء ادائیگی نہیں! 🎉', 'No pending payments! 🎉')}
        </div>
      )}
    </div>
  );
}