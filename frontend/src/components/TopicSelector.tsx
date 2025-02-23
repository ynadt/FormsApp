import React from 'react';
import { Autocomplete, TextField } from '@mui/material';

interface Topic {
  id: string;
  name: string;
}

interface TopicSelectorProps {
  topics: Topic[] | undefined;
  selectedTopicId: string | undefined;
  onChange: (topicId: string | undefined) => void;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({
  topics,
  selectedTopicId,
  onChange,
}) => {
  return (
    <Autocomplete
      options={topics || []}
      getOptionLabel={(topic) => topic.name}
      value={topics?.find((topic) => topic.id === selectedTopicId) || null}
      onChange={(_, value) => onChange(value?.id || undefined)}
      renderInput={(params) => (
        <TextField {...params} label="Topic" placeholder="Select a topic" />
      )}
    />
  );
};

export default TopicSelector;
