import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';

interface ProfileLanguageMenuProps {
  profileAnchorEl: HTMLElement | null;
  onProfileMenuClose: () => void;
  langAnchorEl: HTMLElement | null;
  onLangMenuClose: () => void;
  onLangMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  toggleTheme: () => void;
  logout: () => void;
  onLogin: () => void;
  isSmallScreen: boolean;
  logoutDisabled: boolean;
  userExists: boolean;
}

const ProfileLanguageMenu: React.FC<ProfileLanguageMenuProps> = ({
  profileAnchorEl,
  onProfileMenuClose,
  langAnchorEl,
  onLangMenuClose,
  onLangMenuOpen,
  toggleTheme,
  logout,
  onLogin,
  isSmallScreen,
  logoutDisabled,
  userExists,
}) => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    onLangMenuClose();
  };

  return (
    <>
      <Menu
        anchorEl={profileAnchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(profileAnchorEl)}
        onClose={onProfileMenuClose}
      >
        {isSmallScreen && (
          <>
            <MenuItem onClick={toggleTheme}>
              <Brightness4Icon sx={{ mr: 1 }} />
              {t('appLayout.toggleTheme')}
            </MenuItem>
            <MenuItem onClick={onLangMenuOpen}>
              <SettingsIcon sx={{ mr: 1 }} />
              {t('appLayout.languageSettings')}
            </MenuItem>
          </>
        )}
        {userExists ? (
          <MenuItem
            onClick={() => {
              onProfileMenuClose();
              logout();
            }}
            disabled={logoutDisabled}
          >
            {t('appLayout.logout')}
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              onProfileMenuClose();
              onLogin();
            }}
          >
            {t('appLayout.loginRegister')}
          </MenuItem>
        )}
      </Menu>

      <Menu
        anchorEl={langAnchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(langAnchorEl)}
        onClose={onLangMenuClose}
      >
        <MenuItem onClick={() => changeLanguage('en')}>EN</MenuItem>
        <MenuItem onClick={() => changeLanguage('ru')}>RU</MenuItem>
      </Menu>
    </>
  );
};

export default ProfileLanguageMenu;
