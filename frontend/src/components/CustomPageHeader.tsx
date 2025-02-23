import React from 'react';
import { Typography, Box, Divider, SxProps, Theme } from '@mui/material';
import {
  pageHeaderTitleStyles,
  pageHeaderSubtitleStyles,
} from '../styles/pageHeaderStyles';

interface CustomPageHeaderProps {
  title: string;
  subtitle?: string;
  sx?: SxProps<Theme>;
}

const CustomPageHeader: React.FC<CustomPageHeaderProps> = ({
  title,
  subtitle,
  sx,
}) => {
  return (
    <Box sx={{ mb: 1, ...sx }}>
      <Typography variant="h4" gutterBottom sx={pageHeaderTitleStyles}>
        {title}
      </Typography>
      {subtitle && (
        <>
          <Typography variant="body1" sx={pageHeaderSubtitleStyles}>
            {subtitle}
          </Typography>
          <Divider sx={{ my: 3 }} />
        </>
      )}
    </Box>
  );
};
export default CustomPageHeader;
