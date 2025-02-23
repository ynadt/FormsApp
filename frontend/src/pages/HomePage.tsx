import React from 'react';
import { Box, Divider, Typography } from '@mui/material';
import DashboardLayout from '../components/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { fetchTemplates } from '../api/templates';
import { fetchTags } from '../api/tags';
import TemplateSlider from '../components/TemplateSlider';
import TagCloud from '../components/TagCloud';
import { TemplateListResponse } from '../types/template';
import CustomPageHeader from '../components/CustomPageHeader.tsx';
import { headingStyles } from '../styles/typographyStyles.ts';

const HomePage: React.FC = () => {
  const {
    data: latestTemplates,
    isLoading: isLatestLoading,
    error: latestError,
  } = useQuery<TemplateListResponse>({
    queryKey: ['latestTemplates'],
    queryFn: () => fetchTemplates({ sort: 'newest', limit: 5 }),
  });

  const {
    data: popularTemplates,
    isLoading: isPopularLoading,
    error: popularError,
  } = useQuery<TemplateListResponse>({
    queryKey: ['popularTemplates'],
    queryFn: () => fetchTemplates({ sort: 'popular', limit: 5 }),
  });

  const {
    data: tagsData,
    isLoading: isTagsLoading,
    error: tagsError,
  } = useQuery({
    queryKey: ['tags'],
    queryFn: () => fetchTags(),
  });

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <CustomPageHeader
          title="Welcome to Customizable Forms"
          subtitle="Explore our templates, search for what you need, and get started. Whether you are a guest, a regular user, or an admin, enjoy a unified experience."
        />

        <TemplateSlider
          title="Latest Templates"
          templates={latestTemplates?.data || []}
          isLoading={isLatestLoading}
          error={latestError}
        />

        <Divider sx={{ my: 3 }} />

        <TemplateSlider
          title="Most Popular Templates"
          templates={popularTemplates?.data || []}
          isLoading={isPopularLoading}
          error={popularError}
        />

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" gutterBottom sx={headingStyles}>
          Tag Cloud
        </Typography>
        <TagCloud
          tags={tagsData || []}
          isLoading={isTagsLoading}
          error={tagsError}
        />
      </Box>
    </DashboardLayout>
  );
};

export default HomePage;
