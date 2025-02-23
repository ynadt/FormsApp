import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import CustomPageHeader from '../components/CustomPageHeader.tsx';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
          p: 3,
        }}
      >
        <CustomPageHeader title="Page Not Found" />
        <Typography
          variant="h1"
          sx={{
            fontSize: '6rem',
            fontWeight: 'bold',
            color: 'text.secondary',
            mb: 2,
          }}
        >
          404
        </Typography>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Oops! The page you're looking for doesn't exist.
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
          It seems like you've stumbled upon a page that doesn't exist. Don't
          worry, let's get you back on track.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/')}
          sx={{
            backgroundColor: 'primary.main',
            '&:hover': { backgroundColor: 'primary.dark' },
          }}
        >
          Go Back Home
        </Button>
      </Box>
    </DashboardLayout>
  );
};

export default NotFoundPage;
