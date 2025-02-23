import { SxProps, Theme } from '@mui/material';

export const headingStyles: SxProps<Theme> = {
  fontWeight: 'bold',
  color: 'primary.main',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  mb: 3,
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
