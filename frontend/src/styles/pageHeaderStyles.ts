import { SxProps, Theme } from '@mui/material';

export const pageHeaderTitleStyles: SxProps<Theme> = {
  fontWeight: 'bold',
  color: 'info.dark',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  position: 'relative',
  '&::after': {
    content: '""',
    display: 'block',
    width: '50px',
    height: '3px',
    backgroundColor: 'primary.main',
    position: 'absolute',
    bottom: '-10px',
    left: 0,
  },
};

export const pageHeaderSubtitleStyles: SxProps<Theme> = {
  mt: 2,
  color: 'text.secondary',
};
