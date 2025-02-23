import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Toolbar,
  Typography,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { getNavItems } from '../utils/drawerNavigationUtil.tsx';
import { useAuthStore } from '../store/authStore';
import { useMutation } from '@tanstack/react-query';
import { logoutUser } from '../api/auth';
import { useThemeCustom } from '../ThemeContext';
import SearchBar from './SearchBar';
import ProfileLanguageMenu from './ProfileLanguageMenu';
import { appBarHeight, drawerWidth } from '../constants/constants.ts';

const drawerPaperStyles = {
  width: drawerWidth,
  paddingTop: appBarHeight,
  boxSizing: 'border-box',
  overflowX: 'hidden',
};

const MyAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
}));

// Main content area with left margin if permanent drawer is visible
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'shift' })<{
  shift: boolean;
}>(({ theme, shift }) => ({
  flexGrow: 1,
  marginTop: theme.spacing(8),
  marginLeft: shift ? drawerWidth : 0,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'auto',
}));

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleSearchSubmit = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const { user } = useAuthStore();
  const clearUser = useAuthStore((state) => state.clearUser);
  const { toggleTheme } = useThemeCustom();

  const logoutMutation = useMutation({
    mutationFn: async () => await logoutUser(),
    onSuccess: () => {
      clearUser();
      navigate('/');
    },
  });

  const [profileAnchorEl, setProfileAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };
  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const [langAnchorEl, setLangAnchorEl] = React.useState<null | HTMLElement>(
    null,
  );
  const handleLangMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(event.currentTarget);
  };
  const handleLangMenuClose = () => {
    setLangAnchorEl(null);
  };

  const navItems = getNavItems(user?.role);
  const dashboardLabel = user
    ? user.role === 'ADMIN'
      ? `Admin: ${user.email}`
      : `Dashboard: ${user.email}`
    : '';

  return (
    <Box sx={{ display: 'flex' }}>
      <MyAppBar position="fixed">
        <Toolbar>
          {/* Render burger icon only on small screens */}
          {!isLargeScreen && (
            <IconButton
              color="inherit"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Dashboard label is hidden on small screens */}
          {!isSmallScreen && (
            <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
              {dashboardLabel}
            </Typography>
          )}

          {/* SearchBar component */}
          <SearchBar
            isSmallScreen={isSmallScreen}
            onSearchSubmit={handleSearchSubmit}
          />

          {/* For non-small screens, show language, theme, and user icons */}
          {!isSmallScreen && (
            <>
              <IconButton color="inherit" onClick={handleLangMenuOpen}>
                <SettingsIcon />
              </IconButton>
              <IconButton color="inherit" onClick={toggleTheme}>
                <Brightness4Icon />
              </IconButton>
              <IconButton
                color="inherit"
                onClick={handleProfileMenuOpen}
                size="large"
              >
                <AccountCircleIcon />
              </IconButton>
            </>
          )}

          {/* For small screens, show user icon inside header */}
          {isSmallScreen && (
            <IconButton
              color="inherit"
              onClick={handleProfileMenuOpen}
              size="large"
            >
              <AccountCircleIcon />
            </IconButton>
          )}

          {/* Extracted Profile & Language Menus */}
          <ProfileLanguageMenu
            profileAnchorEl={profileAnchorEl}
            onProfileMenuClose={handleProfileMenuClose}
            langAnchorEl={langAnchorEl}
            onLangMenuClose={handleLangMenuClose}
            onLangMenuOpen={handleLangMenuOpen}
            toggleTheme={toggleTheme}
            logout={() => logoutMutation.mutate()}
            onLogin={() => navigate('/auth')}
            isSmallScreen={isSmallScreen}
            logoutDisabled={logoutMutation.isPending}
            userExists={!!user}
          />
        </Toolbar>
      </MyAppBar>

      {/* Drawer: permanent on large screens, temporary on small screens */}
      {isLargeScreen ? (
        <Drawer
          variant="permanent"
          open
          sx={{ '& .MuiDrawer-paper': drawerPaperStyles }}
        >
          <Divider />
          <List>
            {navItems.map((item) => (
              <React.Fragment key={item.label}>
                <ListItem disablePadding>
                  <Tooltip title={item.label} placement="right">
                    <ListItemButton onClick={() => navigate(item.path)}>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
                {user?.role === 'ADMIN' &&
                  (item.label === 'Home' ||
                    item.label === 'Admin Forms Management') && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': drawerPaperStyles }}
        >
          <Divider />
          <List>
            {navItems.map((item) => (
              <React.Fragment key={item.label}>
                <ListItem disablePadding>
                  <Tooltip title={item.label} placement="right">
                    <ListItemButton onClick={() => navigate(item.path)}>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
                {user?.role === 'ADMIN' &&
                  (item.label === 'Home' || item.label === 'Forms') && (
                    <Divider />
                  )}
              </React.Fragment>
            ))}
          </List>
        </Drawer>
      )}

      {/* Main content area; left margin if permanent drawer is visible */}
      <Main shift={isLargeScreen}>
        <Toolbar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            maxWidth: '1800px',
            width: '100%',
            mx: 'auto',
            p: 1,
          }}
        >
          {children}
        </Box>
      </Main>
    </Box>
  );
};

export default DashboardLayout;
