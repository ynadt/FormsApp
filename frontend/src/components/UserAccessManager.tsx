import React, { useMemo } from 'react';
import { Autocomplete, Chip, CircularProgress, TextField } from '@mui/material';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserAccessManagerProps {
  selectedUsers: User[];
  setSelectedUsers: (users: User[]) => void;
  userSearchInput: string;
  setUserSearchInput: (input: string) => void;
  users: User[] | undefined;
  isFetching: boolean;
}

const UserAccessManager: React.FC<UserAccessManagerProps> = ({
  selectedUsers,
  setSelectedUsers,
  userSearchInput,
  setUserSearchInput,
  users,
  isFetching,
}) => {
  const userColumns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'email', header: 'Email' },
    ],
    [],
  );

  return (
    <>
      <Autocomplete
        multiple
        options={
          users?.filter(
            (user) =>
              !selectedUsers.some((selected) => selected.id === user.id),
          ) || []
        }
        getOptionLabel={(user) => `${user.name} (${user.email})`}
        value={selectedUsers}
        onChange={(_, value) => {
          setSelectedUsers(value);
        }}
        onInputChange={(_, value) => setUserSearchInput(value)}
        openOnFocus={true}
        noOptionsText={
          userSearchInput.length > 0
            ? 'No users found'
            : 'Start typing to search'
        }
        loading={isFetching}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Users"
            placeholder="Search users..."
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {isFetching ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderTags={(value, getTagProps) =>
          value.map((user, index) => (
            <Chip
              label={`${user.name} (${user.email})`}
              {...getTagProps({ index })}
              key={index}
            />
          ))
        }
        isOptionEqualToValue={(option, value) => option.id === value.id}
      />
      {selectedUsers.length > 0 && (
        <MaterialReactTable
          columns={userColumns}
          data={selectedUsers}
          enableRowSelection
          enableSorting
          enableColumnFilters={false}
          enablePagination={false}
          enableBottomToolbar={false}
        />
      )}
    </>
  );
};

export default UserAccessManager;
