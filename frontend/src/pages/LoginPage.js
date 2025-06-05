import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../App';
import LanguageSwitcher from '../components/LanguageSwitcher';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Attempting login with:', email);
    const result = await login(email, password);
    console.log('Login result:', result);
    
    if (result.success) {
      console.log('Login successful, navigating to dashboard');
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <LanguageSwitcher />
          <h1>🍽️ {t('app.title')}</h1>
          <p>{t('app.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@kasa-restaurant.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('auth.password')}</label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t('auth.password')}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? t('auth.signingIn') : t('auth.signIn')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {t('auth.needAccount')}{' '}
            <Link to="/register">{t('auth.createHere')}</Link>
          </p>
          <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
            <strong>{t('auth.demoAccount')}:</strong><br />
            Email: admin@kasa-restaurant.com<br />
            Password: admin123
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
