import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchSearchResults } from '../api/search';
import {
  Box,
  CircularProgress,
  Typography,
  Pagination,
  Stack,
} from '@mui/material';
import DashboardLayout from '../components/DashboardLayout';
import { useAuthStore } from '../store/authStore';
import TemplateCard from '../components/TemplateCard';
import { TemplateListResponse } from '../types/template';
import CustomPageHeader from '../components/CustomPageHeader.tsx';

const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q') || '';
  const initialPage = parseInt(queryParams.get('page') || '1', 10);
  const [page, setPage] = useState(initialPage);
  const limit = 10;

  const { data, isLoading, error } = useQuery<TemplateListResponse>({
    queryKey: ['search', query, page],
    queryFn: () => fetchSearchResults(query, page, limit),
    enabled: !!query,
  });

  const templates = data?.data || [];
  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <CustomPageHeader
          title={`Search Results for “${query}”`}
          subtitle={
            !user
              ? 'Search is limited to public templates. Please log in to see more results.'
              : undefined
          }
        />
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">Error loading search results.</Typography>
        ) : templates.length > 0 ? (
          <>
            <Stack spacing={2}>
              {templates.map((tmpl) => (
                <TemplateCard key={tmpl.id} template={tmpl} />
              ))}
            </Stack>
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        ) : (
          <Typography>No templates found.</Typography>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default SearchResultsPage;
