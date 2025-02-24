import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
  Typography,
  Chip,
  Tooltip,
} from '@mui/material';
import { formatQuestionType } from '../utils/questionUtils.ts';

interface TemplateQuestionsTabProps {
  questions: Array<{
    id: string;
    title: string;
    type: string;
    required: boolean;
    description?: string | null;
    showInResults: boolean;
  }>;
}

const TemplateQuestionsTab: React.FC<TemplateQuestionsTabProps> = ({
  questions,
}) => {
  return (
    <List>
      {questions.map((q, index) => (
        <React.Fragment key={q.id}>
          <ListItem alignItems="flex-start">
            <ListItemText
              primary={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle1">
                    {index + 1}. {q.title}
                  </Typography>
                  {q.required && (
                    <Tooltip title="Required">
                      <Typography variant="subtitle1" color="error">
                        *
                      </Typography>
                    </Tooltip>
                  )}
                  <Chip
                    size="small"
                    label={formatQuestionType(q.type)}
                    color="primary"
                  />
                  {!q.showInResults && (
                    <Chip
                      size="small"
                      label="Not in analytics"
                      color="warning"
                    />
                  )}
                </Stack>
              }
              secondary={
                q.description && (
                  <Typography variant="body2" color="text.secondary">
                    {q.description}
                  </Typography>
                )
              }
            />
          </ListItem>
          {index < questions.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default TemplateQuestionsTab;
