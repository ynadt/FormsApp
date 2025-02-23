import React, { useMemo } from 'react';
import {
  Box,
  CircularProgress,
  Stack,
  Tooltip,
  IconButton,
} from '@mui/material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import DashboardLayout from '../components/DashboardLayout';
import CustomPageHeader from '../components/CustomPageHeader.tsx';
import { UserListResponse } from '../types/user';
import {
  fetchUsers,
  updateUsersRole,
  blockUsers,
  deleteUsers,
} from '../api/adminUsers';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PersonIcon from '@mui/icons-material/Person';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuthStore } from '../store/authStore.ts';
import { useConfirmationDialog } from '../hooks/useConfirmationDialog';
import { useSorting } from '../hooks/useSorting';
import ConfirmationDialog from '../components/ConfirmationDialog.tsx';
import adminUsersColumns from '../constants/adminUsersColumns.tsx';

const AdminUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUserId = useAuthStore.getState().user?.id;
  const { clearUser } = useAuthStore();

  const {
    confirmDialogOpen,
    confirmDialogMessage,
    openConfirmDialog,
    closeConfirmDialog,
    onConfirm,
  } = useConfirmationDialog();

  const { sorting, setSorting, getSortParam } = useSorting([
    { id: 'email', desc: false },
  ]);

  const {
    data: userResponse,
    isFetching,
    refetch,
  } = useQuery<UserListResponse>({
    queryKey: ['users', sorting],
    queryFn: () => fetchUsers({ sort: getSortParam() }),
    refetchOnWindowFocus: false,
  });
  const users = userResponse?.data || [];

  const promoteMutation = useMutation({
    mutationFn: (payload: { ids: string[]; role: string }) =>
      updateUsersRole(payload),
    onSuccess: (data, variables) => {
      if (currentUserId && variables.ids.includes(currentUserId)) {
        toast.error('Your role has been updated. Please log in again.');
        clearUser();
        navigate('/auth');
        return;
      }
      refetch().then(() => {
        if (data.updatedCount === 0) {
          toast.info('No changes made. Users already have the target role.');
        } else {
          toast.success('Users promoted successfully.');
        }
      });
    },
  });

  const demoteMutation = useMutation({
    mutationFn: (payload: { ids: string[]; role: string }) =>
      updateUsersRole(payload),
    onSuccess: (data, variables) => {
      if (currentUserId && variables.ids.includes(currentUserId)) {
        toast.error('Your role has been updated. Please log in again.');
        clearUser();
        navigate('/auth');
        return;
      }
      refetch().then(() => {
        if (data.updatedCount === 0) {
          toast.info('No changes made. Users already have the target role.');
        } else {
          toast.success('Users demoted successfully.');
        }
      });
    },
  });

  const blockMutation = useMutation({
    mutationFn: (payload: { ids: string[]; blocked: boolean }) =>
      blockUsers(payload),
    onSuccess: (data, variables) => {
      if (data.updatedCount === 0) {
        toast.info('No changes made. Users already in desired state.');
      } else if (currentUserId && variables.ids.includes(currentUserId)) {
        toast.error('Your account has been updated. Please log in again.');
        clearUser();
        navigate('/auth');
        return;
      } else {
        toast.success(
          variables.blocked
            ? 'Users blocked successfully.'
            : 'Users unblocked successfully.',
        );
      }
      refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => deleteUsers(ids),
    onSuccess: (_data, variables) => {
      if (currentUserId && variables.includes(currentUserId)) {
        toast.error('Your account has been deleted.');
        clearUser();
        navigate('/auth');
        return;
      }
      refetch().then(() => {
        toast.success('Users deleted successfully.');
      });
    },
  });

  const columns = useMemo(() => adminUsersColumns, []);

  const handlePromote = (selectedIds: string[]) => {
    const idsToPromote = selectedIds.filter((id) => {
      const user = users.find((u) => u.id === id);
      return user && user.role === 'USER';
    });
    if (idsToPromote.length === 0) {
      toast.info('No changes made. Users already have the target role.');
      return;
    }
    if (currentUserId && idsToPromote.includes(currentUserId)) {
      openConfirmDialog(
        'You are promoting yourself. This will update your role. Continue?',
        () => promoteMutation.mutate({ ids: idsToPromote, role: 'ADMIN' }),
      );
    } else {
      promoteMutation.mutate({ ids: idsToPromote, role: 'ADMIN' });
    }
  };

  const handleDemote = (selectedIds: string[]) => {
    const idsToDemote = selectedIds.filter((id) => {
      const user = users.find((u) => u.id === id);
      return user && user.role === 'ADMIN';
    });
    if (idsToDemote.length === 0) {
      toast.info('No changes made. Users already have the target role.');
      return;
    }
    if (currentUserId && idsToDemote.includes(currentUserId)) {
      openConfirmDialog(
        'You are demoting yourself. This will update your role. Continue?',
        () => demoteMutation.mutate({ ids: idsToDemote, role: 'USER' }),
      );
    } else {
      demoteMutation.mutate({ ids: idsToDemote, role: 'USER' });
    }
  };

  const handleBlock = (selectedIds: string[]) => {
    const idsToBlock = selectedIds.filter((id) => {
      const user = users.find((u) => u.id === id);
      return user && !user.blocked;
    });
    if (idsToBlock.length === 0) {
      toast.info('Selected users are already blocked.');
      return;
    }
    if (currentUserId && idsToBlock.includes(currentUserId)) {
      openConfirmDialog(
        'You are blocking yourself. This will disable your account. Continue?',
        () => blockMutation.mutate({ ids: idsToBlock, blocked: true }),
      );
    } else {
      blockMutation.mutate({ ids: idsToBlock, blocked: true });
    }
  };

  const handleUnblock = (selectedIds: string[]) => {
    const idsToUnblock = selectedIds.filter((id) => {
      const user = users.find((u) => u.id === id);
      return user && user.blocked;
    });
    if (idsToUnblock.length === 0) {
      toast.info('Selected users are already unblocked.');
      return;
    }
    blockMutation.mutate({ ids: idsToUnblock, blocked: false });
  };

  const handleDelete = (selectedIds: string[]) => {
    openConfirmDialog(
      'Are you sure you want to delete the selected users? This action cannot be undone.',
      () => {
        deleteMutation.mutate(selectedIds, {
          onSuccess: () => {
            table.setRowSelection({});
          },
        });
      },
    );
  };

  const isBulkLoading =
    promoteMutation.isPending ||
    demoteMutation.isPending ||
    blockMutation.isPending ||
    deleteMutation.isPending ||
    isFetching;

  const table = useMaterialReactTable({
    columns,
    data: users,
    enableColumnFilters: false,
    enableGlobalFilter: false,
    enableColumnOrdering: true,
    enablePagination: true,
    enableColumnPinning: true,
    enableRowSelection: true,
    enableRowActions: false,
    manualSorting: true,
    onSortingChange: setSorting,
    state: { sorting },
    initialState: {
      columnPinning: {
        left: ['mrt-row-select'],
      },
    },
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    muiPaginationProps: {
      color: 'secondary',
      rowsPerPageOptions: [10, 20, 30],
      shape: 'rounded',
      variant: 'outlined',
    },
    muiTableContainerProps: {
      sx: {
        overflowX: 'auto',
      },
    },
    enableHiding: true,
    renderTopToolbarCustomActions: ({ table }) => {
      const selectedIds = table
        .getSelectedRowModel()
        .rows.map((row) => row.original.id);

      return (
        <Stack direction="row" spacing={2} alignItems="center">
          <Tooltip title="Promote Selected">
            <span>
              <IconButton
                onClick={() => handlePromote(selectedIds)}
                disabled={selectedIds.length === 0 || promoteMutation.isPending}
                color="primary"
              >
                <PersonIcon fontSize="small" />
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Demote Selected">
            <span>
              <IconButton
                onClick={() => handleDemote(selectedIds)}
                disabled={selectedIds.length === 0 || demoteMutation.isPending}
                color="primary"
              >
                <PersonIcon fontSize="small" />
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Block Selected">
            <span>
              <IconButton
                onClick={() => handleBlock(selectedIds)}
                disabled={selectedIds.length === 0 || blockMutation.isPending}
                color="warning"
              >
                <BlockIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Unblock Selected">
            <span>
              <IconButton
                onClick={() => handleUnblock(selectedIds)}
                disabled={selectedIds.length === 0 || blockMutation.isPending}
                color="success"
              >
                <CheckCircleOutlineIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Delete Selected">
            <span>
              <IconButton
                onClick={() => handleDelete(selectedIds)}
                disabled={selectedIds.length === 0 || deleteMutation.isPending}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      );
    },
  });

  return (
    <DashboardLayout>
      <Box
        sx={{ p: 2, position: 'relative', width: '100%', overflowX: 'auto' }}
      >
        <CustomPageHeader
          title="Admin - User Management"
          subtitle="Manage users of the App (promote, demote, block, delete)"
        />
        <MaterialReactTable table={table} />
        {isBulkLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(255,255,255,0.7)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Box>
      <ConfirmationDialog
        open={confirmDialogOpen}
        message={confirmDialogMessage}
        onClose={closeConfirmDialog}
        onConfirm={onConfirm}
      />
    </DashboardLayout>
  );
};

export default AdminUsersPage;
