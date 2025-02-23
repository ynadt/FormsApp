import React, { useMemo } from 'react';
import { Box, Typography, Button, ListItemIcon, MenuItem } from '@mui/material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import DashboardLayout from '../components/DashboardLayout';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { FormListResponse } from '../types/form';
import { fetchMyForms, deleteForms } from '../api/forms';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomPageHeader from '../components/CustomPageHeader.tsx';
import Loader from '../components/Loader.tsx';
import { useConfirmationDialog } from '../hooks/useConfirmationDialog';
import { useSorting } from '../hooks/useSorting';
import myFormsColumns from '../constants/myFormsColumns.ts';

const MyFormsPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    confirmDialogOpen,
    confirmDialogMessage,
    openConfirmDialog,
    closeConfirmDialog,
    onConfirm,
  } = useConfirmationDialog();

  const { sorting, setSorting, getSortParam } = useSorting([
    { id: 'createdAt', desc: true },
  ]);

  const {
    data: formResponse,
    isFetching,
    refetch,
  } = useQuery<FormListResponse>({
    queryKey: ['my-forms', sorting],
    queryFn: () => fetchMyForms({ sort: getSortParam() }),
    refetchOnWindowFocus: false,
  });
  const forms = formResponse?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => deleteForms(ids),
    onSuccess: () => {
      refetch().then(() => {
        toast.success('Forms deleted successfully.');
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const columns = useMemo(() => myFormsColumns, []);

  const handleDelete = (selectedIds: string[]) => {
    openConfirmDialog(
      'Are you sure you want to delete the selected forms? This action cannot be undone.',
      () => {
        deleteMutation.mutate(selectedIds, {
          onSuccess: () => {
            table.setRowSelection({});
          },
        });
      },
    );
  };

  const table = useMaterialReactTable({
    columns,
    data: forms,
    enableColumnFilters: false,
    enableGlobalFilter: false,
    enableColumnOrdering: true,
    enablePagination: true,
    enableColumnPinning: true,
    enableRowSelection: true,
    enableRowActions: true,
    manualSorting: true,
    onSortingChange: setSorting,
    state: { sorting },
    initialState: {
      columnPinning: {
        left: ['mrt-row-expand', 'mrt-row-select'],
        right: ['mrt-row-actions'],
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
    renderDetailPanel: ({ row }) => (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          p: 2,
          backgroundColor: 'background.default',
        }}
      >
        {/* Form Author Email */}
        <Typography variant="subtitle1" fontWeight="bold">
          Form Author Name:
        </Typography>
        <Typography variant="body2">
          {row.original.authorName || '—'}
        </Typography>

        {/* Number of Answers */}
        <Typography variant="subtitle1" fontWeight="bold">
          Number of Answers:
        </Typography>
        <Typography variant="body2">
          {row.original.answers ? row.original.answers.length : 0}
        </Typography>

        {/* Last Updated At */}
        <Typography variant="subtitle1" fontWeight="bold">
          Last Updated At:
        </Typography>
        <Typography variant="body2">
          {new Date(row.original.updatedAt).toLocaleString()}
        </Typography>
      </Box>
    ),
    renderRowActionMenuItems: ({ closeMenu, row }) => [
      <MenuItem
        key={0}
        onClick={() => {
          navigate(`/forms/${row.original.id}`);
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <VisibilityIcon fontSize="small" />
        </ListItemIcon>
        View Form
      </MenuItem>,
      <MenuItem
        key={1}
        onClick={() => {
          navigate(`/forms/${row.original.id}/edit`);
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <EditIcon fontSize="small" />
        </ListItemIcon>
        Edit Form
      </MenuItem>,
      <MenuItem
        key={0}
        onClick={() => {
          navigate(`/templates/${row.original.template.id}`);
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <VisibilityIcon fontSize="small" />
        </ListItemIcon>
        View Template
      </MenuItem>,
    ],
    renderTopToolbarCustomActions: ({ table }) => {
      const selectedIds = table
        .getSelectedRowModel()
        .rows.map((row) => row.original.id);

      return (
        <Box sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Button
            color="error"
            disabled={selectedIds.length === 0 || deleteMutation.isPending}
            onClick={() => handleDelete(selectedIds)}
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Delete Selected
          </Button>
        </Box>
      );
    },
  });

  return (
    <DashboardLayout>
      <Box
        sx={{ p: 2, position: 'relative', width: '100%', overflowX: 'auto' }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <CustomPageHeader title="My forms" subtitle="Manage your own forms" />
        </Box>
        <MaterialReactTable table={table} />
        {(deleteMutation.isPending || isFetching) && <Loader />}
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

export default MyFormsPage;
