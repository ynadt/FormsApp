import React from 'react';
import { IconButton, InputBase } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';

const SearchContainer = styled('form')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.grey[200],
  marginRight: theme.spacing(2),
  marginLeft: theme.spacing(2),
  width: 'auto',
  display: 'flex',
  alignItems: 'center',
  paddingLeft: theme.spacing(1),
}));

interface SearchBarProps {
  isSmallScreen: boolean;
  onSearchSubmit: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  isSmallScreen,
  onSearchSubmit,
}) => {
  const [showSearch, setShowSearch] = React.useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    onSearchSubmit(query);
  };

  if (isSmallScreen) {
    return (
      <>
        {showSearch ? (
          <SearchContainer onSubmit={handleSubmit}>
            <InputBase
              name="search"
              placeholder="Search…"
              sx={{ ml: 1, flex: 1 }}
            />
            <IconButton color="inherit" onClick={() => setShowSearch(false)}>
              <CloseIcon />
            </IconButton>
          </SearchContainer>
        ) : (
          <IconButton color="inherit" onClick={() => setShowSearch(true)}>
            <SearchIcon />
          </IconButton>
        )}
      </>
    );
  }

  return (
    <SearchContainer onSubmit={handleSubmit}>
      <SearchIcon />
      <InputBase
        name="search"
        placeholder="Search templates…"
        sx={{ ml: 1, flex: 1 }}
      />
    </SearchContainer>
  );
};

export default SearchBar;
