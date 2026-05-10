import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();

  const navItems = [
    { path: '/', icon: '🏠', label: t('ہوم', 'Home') },
    { path: '/committees', icon: '👥', label: t('کمیٹیاں', 'Committees') },
    { path: '/payments', icon: '💰', label: t('ادائیگیاں', 'Payments') },
    { path: '/profile', icon: '👤', label: t('پروفائل', 'Profile') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-primary">Micro Nisa</Link>
          <div className="flex items-center space-x-3">
            <Link to="/notifications" className="text-2xl relative">
              🔔
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </Link>
            // Inside the Layout component header, add:
            <button 
              onClick={() => setLanguage(language === 'ur' ? 'en' : 'ur')}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', padding: '5px 10px', borderRadius: '5px', color: 'white', cursor: 'pointer' }}
            >
              {language === 'ur' ? 'English' : 'اردو'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        {children}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
        <div className="max-w-md mx-auto flex justify-around py-2">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition ${
                location.pathname === item.path 
                  ? 'text-primary' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

