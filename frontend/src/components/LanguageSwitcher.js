import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      <select 
        value={i18n.language} 
        onChange={(e) => changeLanguage(e.target.value)}
        className="language-select"
      >
        <option value="en">🇺🇸 {t('language.english')}</option>
        <option value="tr">🇹🇷 {t('language.turkish')}</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
