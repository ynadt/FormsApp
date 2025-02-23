import React from 'react';
import { Box, Typography } from '@mui/material';
import Slider from 'react-slick';
import TemplateCard from './TemplateCard';
import { TemplateBase } from '../types/template';
import { headingStyles } from '../styles/typographyStyles.ts';
import { sliderSettings } from '../constants/sliderSettings.tsx';

interface TemplateSliderProps {
  title: string;
  templates: TemplateBase[];
  isLoading: boolean;
  error: Error | null;
}

const TemplateSlider: React.FC<TemplateSliderProps> = ({
  title,
  templates,
  isLoading,
  error,
}) => {
  return (
    <>
      <Typography variant="h5" gutterBottom sx={headingStyles}>
        {title}
      </Typography>
      {isLoading ? (
        <Typography>Loading {title.toLowerCase()}...</Typography>
      ) : error ? (
        <Typography color="error">
          Error loading {title.toLowerCase()}.
        </Typography>
      ) : templates && templates.length > 0 ? (
        <Box sx={{ position: 'relative', px: 5 }}>
          <Slider {...sliderSettings}>
            {templates.map((template) => (
              <Box
                key={template.id}
                sx={{ px: 1, width: { xs: '250px', sm: '300px' } }}
              >
                {' '}
                <Box sx={{ maxHeight: 400, display: 'flex' }}>
                  <TemplateCard template={template} />
                </Box>
              </Box>
            ))}
          </Slider>
        </Box>
      ) : (
        <Typography>No {title.toLowerCase()} found.</Typography>
      )}
    </>
  );
};

export default TemplateSlider;
