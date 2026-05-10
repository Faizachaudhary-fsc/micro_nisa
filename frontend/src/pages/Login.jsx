import React, { useState } from 'react';
import axios from 'axios';
import VoiceWelcome from '../components/VoiceWelcome';

const API_URL = 'http://localhost:5000/api';

export default function Login({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  const getText = (urdu, english) => {
    return language === 'ur' ? urdu : english;
  };

  const toggleLanguage = () => {
    const newLang = language === 'ur' ? 'en' : 'ur';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/send-otp`, { phone });
      if (response.data.success) {
        setStep('otp');
        alert(getText('OTP بھیج دیا گیا۔ کوڈ: 123456', 'OTP sent. Code: 123456'));
      }
    } catch (error) {
      alert(error.response?.data?.error || getText('OTP بھیجنے میں ناکامی', 'Failed to send OTP'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/verify-otp`, { 
        phone, 
        otp, 
        name 
      });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        onLogin();
      }
    } catch (error) {
      alert(error.response?.data?.error || getText('لاگ ان ناکام', 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #9b2c2c 0%, #7b1e1e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    },
    card: {
      background: 'white',
      borderRadius: '20px',
      padding: '32px',
      maxWidth: '400px',
      width: '100%',
      boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#9b2c2c',
      textAlign: 'center',
      marginBottom: '8px'
    },
    subtitle: {
      color: '#666',
      textAlign: 'center',
      marginBottom: '20px'
    },
    languageBtn: {
      textAlign: 'right',
      marginBottom: '20px'
    },
    langButton: {
      background: '#f0f0f0',
      border: 'none',
      padding: '5px 12px',
      borderRadius: '20px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: 'bold',
      color: '#9b2c2c'
    },
    formGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      fontWeight: '500',
      marginBottom: '8px',
      color: '#333'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '10px',
      fontSize: '16px',
      boxSizing: 'border-box',
      outline: 'none'
    },
    button: {
      width: '100%',
      padding: '12px',
      background: '#9b2c2c',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.7 : 1
    },
    hint: {
      fontSize: '12px',
      color: '#999',
      marginTop: '8px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.languageBtn}>
          <button onClick={toggleLanguage} style={styles.langButton}>
            {language === 'ur' ? 'English' : 'اردو'}
          </button>
        </div>
        <h1 style={styles.title}>Micro Nisa</h1>
        <p style={styles.subtitle}>
          {getText('خواتین کی ڈیجیٹل کمیٹی سسٹم', "Women's Digital Committee System")}
        </p>

        {step === 'phone' && (
          <form onSubmit={handleSendOTP}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                {getText('فون نمبر', 'Phone Number')}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03001234567"
                style={styles.input}
                required
              />
            </div>
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? getText('بھیجا جا رہا ہے...', 'Sending...') : getText('OTP بھیجیں', 'Send OTP')}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                {getText('نام', 'Name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={getText('اپنا نام درج کریں', 'Enter your name')}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                {getText('OTP کوڈ', 'OTP Code')}
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                style={styles.input}
                required
              />
              <p style={styles.hint}>
                {getText('ٹیسٹ OTP: 123456', 'Test OTP: 123456')}
              </p>
            </div>
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? getText('لاگ ان ہو رہا ہے...', 'Logging in...') : getText('لاگ ان کریں', 'Login')}
            </button>
          </form>
        )}
      </div>
      <VoiceWelcome />
    </div>
  );
}