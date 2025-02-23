import React from 'react';
import { Autocomplete, Chip, TextField } from '@mui/material';

interface TagSelectorProps {
  tags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  onInputChange: (input: string) => void;
  tagInput: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  tags,
  selectedTags,
  onChange,
  onInputChange,
  tagInput,
}) => {
  return (
    <Autocomplete
      multiple
      freeSolo
      options={tags}
      value={selectedTags}
      onChange={(_, newValue) => onChange(newValue as string[])}
      onInputChange={(_, value) => onInputChange(value)}
      open={tagInput.length > 0}
      renderInput={(params) => (
        <TextField {...params} label="Tags" placeholder="Add tags" />
      )}
      renderTags={(value: string[], getTagProps) =>
        value.map((tag, index) => (
          <Chip label={tag} {...getTagProps({ index })} key={index} />
        ))
      }
    />
  );
};

export default TagSelector;
