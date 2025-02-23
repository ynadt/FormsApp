import { MRT_ColumnDef } from 'material-react-table';
import { TemplateBase } from '../types/template';

const myTemplatesColumns: MRT_ColumnDef<TemplateBase>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    size: 250,
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

export default myTemplatesColumns;
