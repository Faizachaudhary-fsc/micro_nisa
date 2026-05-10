import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Committees from './pages/Committees';
import Payments from './pages/Payments';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

// Layout Component - Add language toggle button
function Layout({ children }) {
  const [language, setLanguage] = React.useState(() => {
    return localStorage.getItem('language') || 'en'; // Default to English
  });

  const getText = (urdu, english) => {
    return language === 'ur' ? urdu : english;
  };

  const toggleLanguage = () => {
    const newLang = language === 'ur' ? 'en' : 'ur';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
    // Reload to apply language change
    window.location.reload();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ 
        background: '#9b2c2c', 
        color: 'white', 
        padding: '15px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '20px', margin: 0 }}>Micro Nisa</h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                padding: '5px 12px',
                borderRadius: '20px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              {language === 'ur' ? 'English' : 'اردو'}
            </button>
            <button 
              onClick={() => window.location.href = '/notifications'} 
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}
            >
              🔔
            </button>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px', paddingBottom: '80px' }}>
        {children}
      </div>
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid #ddd',
        padding: '10px',
        maxWidth: '480px',
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <button onClick={() => window.location.href = '/dashboard'} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
            🏠 {getText('ہوم', 'Home')}
          </button>
          <button onClick={() => window.location.href = '/committees'} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
            👥 {getText('کمیٹیاں', 'Committees')}
          </button>
          <button onClick={() => window.location.href = '/payments'} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
            💰 {getText('ادائیگیاں', 'Payments')}
          </button>
          <button onClick={() => window.location.href = '/profile'} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
            👤 {getText('پروفائل', 'Profile')}
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/committees" element={<Layout><Committees /></Layout>} />
        <Route path="/payments" element={<Layout><Payments /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;