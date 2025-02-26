import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import QuizIcon from '@mui/icons-material/Quiz';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useTranslation } from 'react-i18next';

export interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

export const getNavItems = (role?: string): NavItem[] => {
  const { t } = useTranslation();

  if (!role) {
    return [{ label: t('appLayout.home'), icon: <HomeIcon />, path: '/' }];
  }
  if (role === 'ADMIN') {
    return [
      { label: t('appLayout.home'), icon: <HomeIcon />, path: '/' },
      {
        label: t('appLayout.users'),
        icon: <PeopleIcon />,
        path: '/admin/users',
      },
      {
        label: t('appLayout.adminTemplatesManagement'),
        icon: <StickyNote2Icon />,
        path: '/admin/templates',
      },
      {
        label: t('appLayout.adminFormsManagement'),
        icon: <AssignmentIcon />,
        path: '/admin/forms',
      },
      {
        label: t('appLayout.myTemplates'),
        icon: <QuizIcon />,
        path: '/my-templates',
      },
      {
        label: t('appLayout.myForms'),
        icon: <AssignmentTurnedInIcon />,
        path: '/my-forms',
      },
    ];
  }
  return [
    { label: t('appLayout.home'), icon: <HomeIcon />, path: '/' },
    {
      label: t('appLayout.myTemplates'),
      icon: <QuizIcon />,
      path: '/my-templates',
    },
    {
      label: t('appLayout.myForms'),
      icon: <AssignmentTurnedInIcon />,
      path: '/my-forms',
    },
  ];
};
