import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import QuizIcon from '@mui/icons-material/Quiz';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import AssignmentIcon from '@mui/icons-material/Assignment';

export interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

export const getNavItems = (role?: string): NavItem[] => {
  if (!role) {
    return [{ label: 'Home', icon: <HomeIcon />, path: '/' }];
  }
  if (role === 'ADMIN') {
    return [
      { label: 'Home', icon: <HomeIcon />, path: '/' },
      { label: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
      {
        label: 'Admin Templates Management',
        icon: <StickyNote2Icon />,
        path: '/admin/templates',
      },
      {
        label: 'Admin Forms Management',
        icon: <AssignmentIcon />,
        path: '/admin/forms',
      },
      { label: 'My Templates', icon: <QuizIcon />, path: '/my-templates' },
      {
        label: 'My Forms',
        icon: <AssignmentTurnedInIcon />,
        path: '/my-forms',
      },
    ];
  }
  return [
    { label: 'Home', icon: <HomeIcon />, path: '/' },
    { label: 'My Templates', icon: <QuizIcon />, path: '/my-templates' },
    { label: 'My Forms', icon: <AssignmentTurnedInIcon />, path: '/my-forms' },
  ];
};
