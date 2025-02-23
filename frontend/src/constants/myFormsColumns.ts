import { MRT_ColumnDef } from 'material-react-table';
import { FormType } from '../types/form.ts';

const myFormsColumns: MRT_ColumnDef<FormType>[] = [
  {
    accessorKey: 'id',
    header: 'Form ID',
    size: 150,
  },
  {
    accessorKey: 'authorEmail',
    header: 'Form Author Email',
    Cell: ({ cell }) => cell.getValue<string>() || '—',
    size: 250,
  },
  {
    accessorKey: 'createdAt',
    header: 'Form Created At',
    Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
    size: 200,
  },
  {
    accessorKey: 'updatedAt',
    header: 'Form Updated At',
    Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
    size: 200,
  },
  {
    accessorFn: (row) => row.template?.title || '—',
    id: 'templateTitle',
    header: 'Template Title',
    size: 250,
  },
];

export default myFormsColumns;
