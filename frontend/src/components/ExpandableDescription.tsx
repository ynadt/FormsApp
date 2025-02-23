import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import ReactMarkdown from 'react-markdown';

interface ExpandableDescriptionProps {
  description: string | null;
  maxLength?: number;
}

const ExpandableDescription: React.FC<ExpandableDescriptionProps> = ({
  description,
  maxLength = 200,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!description) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="body1"
        component="div"
        sx={{
          lineHeight: 1.6,
          color: 'text.secondary',
          display: '-webkit-box',
          WebkitLineClamp: expanded ? 'unset' : 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        <ReactMarkdown unwrapDisallowed>{description}</ReactMarkdown>
      </Typography>
      {description.length > maxLength && (
        <Button
          onClick={() => setExpanded(!expanded)}
          size="small"
          sx={{ mt: 1 }}
        >
          {expanded ? 'Read Less' : 'Read More'}
        </Button>
      )}
    </Box>
  );
};

export default ExpandableDescription;
