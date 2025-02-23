import React from 'react';
import { Stack, Chip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface TagCloudProps {
  tags: { id: string; name: string }[];
  isLoading: boolean;
  error: Error | null;
}

const TagCloud: React.FC<TagCloudProps> = ({ tags, isLoading, error }) => {
  const navigate = useNavigate();

  return (
    <>
      {isLoading ? (
        <Typography>Loading tags...</Typography>
      ) : error ? (
        <Typography color="error">Error loading tags.</Typography>
      ) : tags && tags.length > 0 ? (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {tags.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.name}
              clickable
              onClick={() =>
                navigate(`/search?q=${encodeURIComponent(tag.name)}`)
              }
              sx={{ mb: 1 }}
            />
          ))}
        </Stack>
      ) : (
        <Typography>No tags found.</Typography>
      )}
    </>
  );
};

export default TagCloud;
