import React from 'react';
import {
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { FormType } from '../types/form.ts';
import { MRT_ColumnDef } from 'material-react-table';

interface TemplateFormsTabProps {
  forms: FormType[];
  isLoading: boolean;
  error: Error | null;
}

const formColumns: MRT_ColumnDef<FormType>[] = [
  {
    accessorKey: 'id',
    header: 'Form ID',
  },
  {
    accessorKey: 'user.email',
    header: 'Submitted By',
    Cell: ({ row }) => {
      return row.original.authorName && row.original.authorEmail
        ? `${row.original.authorName} (${row.original.authorEmail})`
        : row.original.authorEmail || '—';
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated At',
    Cell: ({ cell }) =>
      cell.getValue<string>()
        ? new Date(cell.getValue<string>()).toLocaleString()
        : 'N/A',
  },
];

const TemplateFormsTab: React.FC<TemplateFormsTabProps> = ({
  forms,
  isLoading,
  error,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error">
        Error loading forms: {error.message}
      </Typography>
    );
  }

  if (forms.length === 0) {
    return <Typography>No forms submitted yet.</Typography>;
  }

  return (
    <MaterialReactTable
      columns={formColumns}
      data={forms}
      enableRowActions
      positionActionsColumn="last"
      renderRowActions={({ row }) => (
        <Tooltip title="View">
          <IconButton
            onClick={() => navigate(`/forms/${row.original.id}`)}
            size="small"
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    />
  );
};

export default TemplateFormsTab;
