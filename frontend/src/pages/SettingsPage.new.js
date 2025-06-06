import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../App';
import LanguageSwitcher from '../components/LanguageSwitcher';

const SettingsPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        setError(t('errors.somethingWentWrong'));
      }
    } catch (err) {
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user?.role]);

  const updateUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        setSuccessMessage(t('settings.roleUpdated'));
        fetchUsers();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || t('errors.somethingWentWrong'));
      }
    } catch (err) {
      setError(t('errors.networkError'));
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        setSuccessMessage(t('settings.statusUpdated'));
        fetchUsers();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || t('errors.somethingWentWrong'));
      }
    } catch (err) {
      setError(t('errors.networkError'));
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm(t('settings.confirmDelete'))) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccessMessage(t('settings.userDeleted'));
        fetchUsers();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || t('errors.somethingWentWrong'));
      }
    } catch (err) {
      setError(t('errors.networkError'));
    }
  };

  // Only admin can access this page
  if (!user || user.role !== 'admin') {
    return (
      <div className="access-denied">
        <h1>403</h1>
        <h2>{t('errors.unauthorized')}</h2>
        <p>{t('errors.forbidden')} - {t('settings.adminOnly')}</p>
        <button onClick={logout} className="btn btn-primary">
          {t('auth.logout')}
        </button>
      </div>
    );
  }

  return (
    <div className="settings">
      <header className="settings-header">
        <h1 className="settings-title">{t('settings.title')}</h1>
        <div className="header-controls">
          <LanguageSwitcher />
          <button 
            onClick={logout}
            className="btn btn-secondary"
          >
            {t('auth.logout')}
          </button>
        </div>
      </header>

      <main className="settings-content">
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <div className="settings-section">
          <h2>{t('settings.userManagement')}</h2>
          <p>{t('settings.userManagementDescription')}</p>

          {loading ? (
            <div className="loading-row">
              <div className="loading-spinner"></div>
              <p>{t('common.loading')}</p>
            </div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>{t('settings.name')}</th>
                    <th>{t('settings.email')}</th>
                    <th>{t('settings.role')}</th>
                    <th>{t('settings.status')}</th>
                    <th>{t('settings.registeredAt')}</th>
                    <th>{t('settings.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="loading-row">
                        {t('settings.noUsers')}
                      </td>
                    </tr>
                  ) : (
                    users.map((userItem) => (
                      <tr key={userItem.id}>
                        <td>
                          <div className="user-name">
                            {userItem.first_name} {userItem.last_name}
                          </div>
                        </td>
                        <td>
                          <div className="user-email">{userItem.email}</div>
                        </td>
                        <td>
                          <select
                            value={userItem.role}
                            onChange={(e) => updateUserRole(userItem.id, e.target.value)}
                            className="role-select"
                            disabled={userItem.id === user.id}
                          >
                            <option value="admin">{t('auth.roles.admin')}</option>
                            <option value="executive">{t('auth.roles.executive')}</option>
                            <option value="chef">{t('auth.roles.chef')}</option>
                            <option value="manager">{t('auth.roles.manager')}</option>
                            <option value="employee">{t('auth.roles.employee')}</option>
                          </select>
                        </td>
                        <td>
                          <span className={`status-badge ${userItem.is_active ? 'active' : 'inactive'}`}>
                            {userItem.is_active ? t('settings.active') : t('settings.inactive')}
                          </span>
                        </td>
                        <td>
                          {new Date(userItem.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="user-actions">
                            <button
                              onClick={() => toggleUserStatus(userItem.id, userItem.is_active)}
                              className={`btn btn-small ${userItem.is_active ? 'btn-secondary' : 'btn-primary'}`}
                              disabled={userItem.id === user.id}
                            >
                              {userItem.is_active ? t('settings.deactivate') : t('settings.activate')}
                            </button>
                            <button
                              onClick={() => deleteUser(userItem.id)}
                              className="btn btn-small btn-danger"
                              disabled={userItem.id === user.id}
                            >
                              {t('settings.delete')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
