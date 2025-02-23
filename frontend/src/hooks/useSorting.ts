import { useState } from 'react';
import { MRT_SortingState } from 'material-react-table';

export const useSorting = (defaultSorting: MRT_SortingState = []) => {
  const [sorting, setSorting] = useState<MRT_SortingState>(defaultSorting);

  const getSortParam = () => {
    return sorting
      .map((sort) => `${sort.id}:${sort.desc ? 'desc' : 'asc'}`)
      .join(',');
  };

  return {
    sorting,
    setSorting,
    getSortParam,
  };
};
