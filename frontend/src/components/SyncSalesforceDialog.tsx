import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from '@mui/material';

interface SyncSalesforceDialogProps {
  open: boolean;
  onClose: () => void;
  formData: { name: string; email: string; phone: string };
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSync: () => void;
  isSyncing: boolean;
  isCreateMode: boolean;
}

const SyncSalesforceDialog: React.FC<SyncSalesforceDialogProps> = ({
  open,
  onClose,
  formData,
  onFormChange,
  onSync,
  isSyncing,
  isCreateMode,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {isCreateMode ? 'Create Salesforce Record' : 'Sync with Salesforce'}
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          name="name"
          fullWidth
          value={formData.name}
          onChange={onFormChange}
          sx={{ mt: 2 }}
        />
        <TextField
          label="Email"
          name="email"
          fullWidth
          value={formData.email}
          onChange={onFormChange}
          sx={{ mt: 2 }}
        />
        <TextField
          label="Phone"
          name="phone"
          fullWidth
          value={formData.phone}
          onChange={onFormChange}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={onSync} color="primary" disabled={isSyncing}>
          {isSyncing
            ? isCreateMode
              ? 'Creating...'
              : 'Syncing...'
            : isCreateMode
              ? 'Create'
              : 'Sync'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SyncSalesforceDialog;
