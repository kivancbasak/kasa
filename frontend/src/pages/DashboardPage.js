import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../App';
import LanguageSwitcher from '../components/LanguageSwitcher';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [selectedSubItem, setSelectedSubItem] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const services = [
    {
      id: 'staff',
      title: t('dashboard.features.staffManagement.title'),
      description: t('dashboard.features.staffManagement.description'),
      subItems: [
        {
          id: 'employee-management',
          title: t('staff.employeeManagement'),
          description: t('staff.employeeManagementDesc')
        },
        {
          id: 'work-scheduling',
          title: t('staff.scheduling'),
          description: t('staff.schedulingDesc')
        },
        {
          id: 'performance-tracking',
          title: t('staff.performance'),
          description: t('staff.performanceDesc')
        }
      ]
    },
    {
      id: 'inventory',
      title: t('dashboard.features.inventoryControl.title'),
      description: t('dashboard.features.inventoryControl.description'),
      subItems: [
        {
          id: 'ingredient-management',
          title: t('inventory.ingredients'),
          description: t('inventory.ingredientsDesc')
        },
        {
          id: 'stock-alerts',
          title: t('inventory.alerts'),
          description: t('inventory.alertsDesc')
        },
        {
          id: 'inventory-tracking',
          title: t('inventory.tracking'),
          description: t('inventory.trackingDesc')
        }
      ]
    },
    {
      id: 'reports',
      title: t('dashboard.features.financialReports.title'),
      description: t('dashboard.features.financialReports.description'),
      subItems: [
        {
          id: 'sales-reports',
          title: t('reports.sales'),
          description: t('reports.salesDesc')
        },
        {
          id: 'profit-analysis',
          title: t('reports.profit'),
          description: t('reports.profitDesc')
        },
        {
          id: 'analytics-dashboard',
          title: t('reports.analytics'),
          description: t('reports.analyticsDesc')
        }
      ]
    },
    {
      id: 'recipes',
      title: t('dashboard.features.recipeManagement.title'),
      description: t('dashboard.features.recipeManagement.description'),
      subItems: [
        {
          id: 'recipe-creation',
          title: t('recipes.create'),
          description: t('recipes.createDesc')
        },
        {
          id: 'recipe-ingredients',
          title: t('recipes.ingredients'),
          description: t('recipes.ingredientsDesc')
        },
        {
          id: 'cooking-instructions',
          title: t('recipes.instructions'),
          description: t('recipes.instructionsDesc')
        }
      ]
    }
  ];

  const handleSubItemClick = (subItemId) => {
    setSelectedSubItem(subItemId);
  };

  const renderMainContent = () => {
    if (!selectedSubItem) {
      return (
        <div className="main-welcome">
          <div className="welcome-content">
            <h1>🍽️ {t('app.title')}</h1>
            <p className="welcome-subtitle">{t('dashboard.welcome')}</p>
            <p className="welcome-description">{t('dashboard.selectService')}</p>
          </div>
        </div>
      );
    }

    // Find the selected service and sub-item
    const service = services.find(s => s.subItems.some(item => item.id === selectedSubItem));
    const subItem = service?.subItems.find(item => item.id === selectedSubItem);

    if (!subItem) {
      return <div className="error-content">Content not found</div>;
    }

    return (
      <div className="service-content">
        <div className="service-header">
          <h2>{subItem.title}</h2>
          <p className="service-description">{subItem.description}</p>
        </div>
        <div className="content-placeholder">
          <div className="coming-soon">
            <h3>{t('common.comingSoon')}</h3>
            <p>This feature is currently under development.</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>🍽️ {t('app.title')}</h1>
        </div>
        <div className="header-right">
          <LanguageSwitcher />
          <div className="user-dropdown-container">
            <button 
              className="user-button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              👤 {user?.firstName} {user?.lastName}
              <span className="dropdown-arrow">▼</span>
            </button>
            {showUserDropdown && (
              <div className="user-dropdown">
                <div className="user-info">
                  <span className={`user-role role-${user?.role}`}>
                    {user?.role ? t(`auth.roles.${user.role}`) : user?.role}
                  </span>
                </div>
                <div className="dropdown-divider"></div>
                {user?.role === 'admin' && (
                  <Link to="/settings" className="dropdown-item">
                    ⚙️ {t('settings.title')}
                  </Link>
                )}
                <button onClick={logout} className="dropdown-item logout-item">
                  🚪 {t('auth.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            {services.map((service) => (
              <div key={service.id} className="sidebar-section">
                <div className="sidebar-item service-item">
                  <span className="sidebar-title">{service.title}</span>
                </div>
                
                <div className="sidebar-subitems">
                  {service.subItems.map((subItem) => (
                    <button
                      key={subItem.id}
                      className={`sidebar-item sub-item ${selectedSubItem === subItem.id ? 'active' : ''}`}
                      onClick={() => handleSubItemClick(subItem.id)}
                    >
                      <span className="sidebar-title">{subItem.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
