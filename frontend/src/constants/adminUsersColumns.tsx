import { MRT_ColumnDef } from 'material-react-table';
import { Chip } from '@mui/material';
import { User } from '../types/user.ts';

const adminUsersColumns: MRT_ColumnDef<User>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
    size: 250,
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    Cell: ({ cell }) => (
      <Chip
        label={cell.getValue<string>()}
        color={cell.getValue<string>() === 'ADMIN' ? 'primary' : 'default'}
        size="small"
      />
    ),
  },
  {
    accessorKey: 'blocked',
    header: 'Blocked',
    Cell: ({ cell }) => (
      <Chip
        label={cell.getValue<boolean>() ? 'Blocked' : 'Active'}
        color={cell.getValue<boolean>() ? 'error' : 'success'}
        size="small"
      />
    ),
  },
];

export default adminUsersColumns;
