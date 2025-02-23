import { MRT_ColumnDef } from 'material-react-table';
import { TemplateBase } from '../types/template';

const adminTemplateColumns: MRT_ColumnDef<TemplateBase>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    size: 250,
  },
  {
    accessorKey: 'authorEmail',
    header: 'Author',
    Cell: ({ cell }) => cell.getValue<string>() || '—',
  },
  {
    accessorKey: 'public',
    header: 'Public',
    Cell: ({ cell }) => (cell.getValue<boolean>() ? 'Yes' : 'No'),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
  },
];

export default adminTemplateColumns;
