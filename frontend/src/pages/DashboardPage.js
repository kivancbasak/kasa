import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../App';
import LanguageSwitcher from '../components/LanguageSwitcher';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
  };

  const upcomingFeatures = [
    {
      title: t('dashboard.features.menuManagement.title'),
      description: t('dashboard.features.menuManagement.description'),
      status: "coming-soon"
    },
    {
      title: t('dashboard.features.orderManagement.title'),
      description: t('dashboard.features.orderManagement.description'),
      status: "coming-soon"
    },
    {
      title: t('dashboard.features.tableManagement.title'),
      description: t('dashboard.features.tableManagement.description'),
      status: "coming-soon"
    },
    {
      title: t('dashboard.features.staffManagement.title'),
      description: t('dashboard.features.staffManagement.description'),
      status: "coming-soon"
    },
    {
      title: t('dashboard.features.inventoryControl.title'),
      description: t('dashboard.features.inventoryControl.description'),
      status: "coming-soon"
    },
    {
      title: t('dashboard.features.financialReports.title'),
      description: t('dashboard.features.financialReports.description'),
      status: "coming-soon"
    },
    {
      title: t('dashboard.features.customerManagement.title'),
      description: t('dashboard.features.customerManagement.description'),
      status: "coming-soon"
    },
    {
      title: t('dashboard.features.multiLocationSupport.title'),
      description: t('dashboard.features.multiLocationSupport.description'),
      status: "coming-soon"
    }
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">{t('dashboard.title')}</h1>
        <div className="header-controls">
          <LanguageSwitcher />
          <div className="user-info">
            <span className="user-name">
              {user?.firstName} {user?.lastName}
            </span>
            <span className={`user-role ${user?.role}`}>
              {user?.role}
            </span>
            <button 
              onClick={handleLogout}
              className="btn btn-secondary"
            >
              {t('auth.logout')}
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="welcome-card">
          <h2>{t('dashboard.welcomeTitle')}</h2>
          <p>
            {t('dashboard.welcomeDescription')}
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <h3>{t('dashboard.userAuthenticationTitle')}</h3>
            <p>{t('dashboard.userAuthenticationDescription')}</p>
            <span className="feature-status available">{t('dashboard.availableNow')}</span>
          </div>

          {upcomingFeatures.map((feature, index) => (
            <div key={index} className="feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <span className={`feature-status ${feature.status}`}>
                {t('dashboard.comingSoon')}
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '48px', textAlign: 'center', color: '#666' }}>
          <p>
            {t('dashboard.developmentNote')}
          </p>
          <p style={{ marginTop: '16px' }}>
            {t('dashboard.currentVersion')}
          </p>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
