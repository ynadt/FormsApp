import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Typography, Divider, Stack, Box } from '@mui/material';
import { TemplateBase } from '../types/template';
import TagCloud from './TagCloud';
import LikeButton from './LikeButton';
import ReactMarkdown from 'react-markdown';

interface TemplateCardProps {
  template: TemplateBase;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  const navigate = useNavigate();

  return (
    <Paper
      sx={{
        p: 2,
        cursor: 'pointer',
        transition: 'box-shadow 0.3s ease',
        '&:hover': { boxShadow: 6 },
        mb: 2,
        height: '300px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
      elevation={2}
      onClick={() => navigate(`/templates/${template.id}`)}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {template.title.length > 50
            ? `${template.title.slice(0, 50)}...`
            : template.title}
        </Typography>
        <LikeButton templateId={template.id} />
      </Stack>
      <Divider sx={{ mb: 1 }} />

      {template.description && (
        <Box
          sx={{
            overflowY: 'auto',
            flexGrow: 1,
            maxHeight: '100px',
            mb: 0,
          }}
        >
          <Typography
            variant="body2"
            component="div"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              mb: 1,
            }}
          >
            <ReactMarkdown>{template.description}</ReactMarkdown>
          </Typography>
        </Box>
      )}

      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="caption">
          Last updated: {new Date(template.updatedAt).toLocaleString()}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>Author:</strong>{' '}
        {template.authorName
          ? `${template.authorName} (${template.authorEmail})`
          : template.authorEmail}
      </Typography>
      {template.topic && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Topic:</strong> {template.topic.name}
        </Typography>
      )}

      {template.tags && template.tags.length > 0 && (
        <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
          {' '}
          <TagCloud
            tags={template.tags.slice(0, 3)}
            isLoading={false}
            error={null}
          />
          {template.tags.length > 3 && (
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              +{template.tags.length - 3} more
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default TemplateCard;
