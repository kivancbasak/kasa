import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../App';
import LanguageSwitcher from '../components/LanguageSwitcher';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register, user } = useAuth();
  const { t } = useTranslation();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordsDontMatch'));
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError(t('auth.passwordMinLength'));
      setLoading(false);
      return;
    }

    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password
    });
    
    if (!result.success) {
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
          <p>{t('auth.signUp')}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="firstName">{t('auth.firstName')}</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              className="form-input"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder={t('auth.firstName')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">{t('auth.lastName')}</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              className="form-input"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder={t('auth.lastName')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder={t('auth.email')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('auth.password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder={t('auth.password')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder={t('auth.confirmPassword')}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? t('auth.signingUp') : t('auth.signUp')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {t('auth.haveAccount')}{' '}
            <Link to="/login">{t('auth.signInHere')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
