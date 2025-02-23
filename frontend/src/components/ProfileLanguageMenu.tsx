import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import SettingsIcon from '@mui/icons-material/Settings';

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
        {/* On small screens, include theme and language settings inside profile menu */}
        {isSmallScreen && (
          <>
            <MenuItem onClick={toggleTheme}>
              <Brightness4Icon sx={{ mr: 1 }} />
              Toggle Theme
            </MenuItem>
            <MenuItem onClick={onLangMenuOpen}>
              <SettingsIcon sx={{ mr: 1 }} />
              Language Settings
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
            Logout
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              onProfileMenuClose();
              onLogin();
            }}
          >
            Login / Register
          </MenuItem>
        )}
      </Menu>

      {/* Language Menu (for non-small screens) */}
      <Menu
        anchorEl={langAnchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(langAnchorEl)}
        onClose={onLangMenuClose}
      >
        <MenuItem
          onClick={() => {
            onLangMenuClose();
            console.log('Switch to EN');
          }}
        >
          EN
        </MenuItem>
        <MenuItem
          onClick={() => {
            onLangMenuClose();
            console.log('Switch to RU');
          }}
        >
          RU
        </MenuItem>
      </Menu>
    </>
  );
};

export default ProfileLanguageMenu;
