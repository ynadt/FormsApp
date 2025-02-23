import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  ListItemIcon,
  MenuItem,
  Chip,
  Fab,
  Tooltip,
} from '@mui/material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import DashboardLayout from '../components/DashboardLayout';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { TemplateListResponse } from '../types/template';
import { fetchMyTemplates, deleteTemplates } from '../api/templates';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CustomPageHeader from '../components/CustomPageHeader.tsx';
import ReactMarkdown from 'react-markdown';
import Loader from '../components/Loader.tsx';
import { useConfirmationDialog } from '../hooks/useConfirmationDialog';
import { useSorting } from '../hooks/useSorting';
import myTemplatesColumns from '../constants/myTemplatesColumns.ts';

const MyTemplatesPage: React.FC = () => {
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
    data: templateResponse,
    isFetching,
    refetch,
  } = useQuery<TemplateListResponse>({
    queryKey: ['my-templates', sorting],
    queryFn: () => fetchMyTemplates({ sort: getSortParam() }),
    refetchOnWindowFocus: false,
  });
  const templates = templateResponse?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => deleteTemplates(ids),
    onSuccess: () => {
      refetch().then(() => {
        toast.success('Templates deleted successfully.');
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const columns = useMemo(() => myTemplatesColumns, []);

  const handleDelete = (selectedIds: string[]) => {
    openConfirmDialog(
      'Are you sure you want to delete the selected templates? This action cannot be undone.',
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
    data: templates,
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
        {row.original.image_url && (
          <Box
            component="img"
            src={row.original.image_url}
            alt={row.original.title}
            sx={{
              maxWidth: '200px',
              borderRadius: 1,
              boxShadow: 1,
              mt: 1,
            }}
          />
        )}
        <Typography variant="subtitle1" fontWeight="bold">
          Author:
        </Typography>
        <Typography variant="body2">
          {row.original.authorName || '—'}
        </Typography>
        <Typography variant="subtitle1" fontWeight="bold">
          Description:
        </Typography>
        <ReactMarkdown unwrapDisallowed>
          {row.original.description || 'No description provided.'}
        </ReactMarkdown>
        <Typography variant="subtitle1" fontWeight="bold">
          Topic:
        </Typography>
        <Typography variant="body2">
          {row.original.topic?.name || '—'}
        </Typography>
        {row.original.tags && row.original.tags.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
              mt: 1,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Tags:
            </Typography>
            {row.original.tags.map((tag) => (
              <Chip key={tag.id} label={tag.name} size="small" />
            ))}
          </Box>
        )}
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
          navigate(`/templates/${row.original.id}`);
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <VisibilityIcon fontSize="small" />
        </ListItemIcon>
        View
      </MenuItem>,
      <MenuItem
        key={1}
        onClick={() => {
          navigate(`/templates/${row.original.id}/edit`);
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <EditIcon fontSize="small" />
        </ListItemIcon>
        Edit
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
          <CustomPageHeader
            title="My templates"
            subtitle="Manage your own templates"
          />
          <Tooltip title="Create new template">
            <Fab
              size="medium"
              color="primary"
              onClick={() => navigate('/templates/new')}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
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

export default MyTemplatesPage;
