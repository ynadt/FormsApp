import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardLayout from '../components/DashboardLayout';
import { useAuthStore } from '../store/authStore';
import { syncWithSalesforce, checkSalesforceAccount } from '../api/salesforce';
import SyncSalesforceDialog from '../components/SyncSalesforceDialog';

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
  });
  const [accountExists, setAccountExists] = useState(false);

  const { data: accountData, isLoading: isAccountLoading } = useQuery({
    queryKey: ['salesforceAccount', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User ID is required');
      return await checkSalesforceAccount(user.id);
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (accountData) {
      if (accountData.exists) {
        setFormData({
          name: accountData.account?.name || '',
          email: accountData.contact?.email || '',
          phone: accountData.contact?.phone || '',
        });
        setAccountExists(true);
      } else {
        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          phone: '',
        });
        setAccountExists(false);
      }
    }
  }, [accountData, user]);

  const syncAccountMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User ID is required');
      return await syncWithSalesforce(user.id, formData);
    },
    onSuccess: (data) => {
      toast.success(
        data.message || 'Account and Contact processed successfully!',
      );
      setOpen(false);
    },
    onError: (error) => {
      toast.error(
        error.message ||
          'Failed to process Salesforce record. Please try again.',
      );
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            User Information
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Name:</strong> {user?.name}
          </Typography>
          <Typography variant="body1">
            <strong>Email:</strong> {user?.email}
          </Typography>

          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => setOpen(true)}
            disabled={isAccountLoading}
          >
            {isAccountLoading
              ? 'Loading...'
              : accountExists
                ? 'Sync with Salesforce'
                : 'Create Salesforce Record'}
          </Button>
        </Paper>

        <SyncSalesforceDialog
          open={open}
          onClose={() => setOpen(false)}
          formData={formData}
          onFormChange={handleChange}
          onSync={() => syncAccountMutation.mutate()}
          isSyncing={syncAccountMutation.isPending}
          isCreateMode={!accountExists}
        />
      </Box>
    </DashboardLayout>
  );
};

export default ProfilePage;
