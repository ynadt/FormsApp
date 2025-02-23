import React from 'react';
import { Box, Typography } from '@mui/material';

interface QuestionAnswerBoxProps {
  question: {
    id: string;
    title: string;
    description?: string | null;
    required: boolean;
  };
  answer: string;
  index: number;
}

const QuestionAnswerBox: React.FC<QuestionAnswerBoxProps> = ({
  question,
  answer,
  index,
}) => {
  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[800],
      }}
    >
      <Typography variant="subtitle1">
        {index + 1}. {question.title}{' '}
        {question.required && <span style={{ color: 'red' }}>*</span>}
      </Typography>
      {question.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {question.description}
        </Typography>
      )}
      <Typography variant="body1">
        <strong>Answer:</strong> {answer}
      </Typography>
    </Box>
  );
};

export default QuestionAnswerBox;
