import { useState } from 'react';

export const useConfirmationDialog = () => {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogMessage, setConfirmDialogMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});

  const openConfirmDialog = (message: string, action: () => void) => {
    setConfirmDialogMessage(message);
    setConfirmAction(() => action);
    setConfirmDialogOpen(true);
  };

  const closeConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };

  const onConfirm = () => {
    confirmAction();
    closeConfirmDialog();
  };

  return {
    confirmDialogOpen,
    confirmDialogMessage,
    openConfirmDialog,
    closeConfirmDialog,
    onConfirm,
  };
};
