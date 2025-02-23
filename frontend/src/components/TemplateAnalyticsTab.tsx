import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Stack,
  Tooltip,
} from '@mui/material';
import CheckboxProgressBar from './CheckboxProgressBar';
import { AnalyticsData } from '../types/analytics.ts';

interface TemplateAnalyticsTabProps {
  analytics: AnalyticsData | null;
  isLoading: boolean;
  error: Error | null;
}

const TemplateAnalyticsTab: React.FC<TemplateAnalyticsTabProps> = ({
  analytics,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error">
        Error loading analytics: {error.message}
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Total Forms Submitted: {analytics?.responseCount ?? 0}
      </Typography>
      {analytics?.responseCount && analytics.responseCount > 0
        ? analytics.questionAnalyticsData.map((qa: any, idx: number) => (
            <Box
              key={qa.questionId}
              sx={{
                mt: 2,
                p: 2,
                border: '1px solid #ccc',
                borderRadius: 2,
                backgroundColor: '#f9f9f9',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {idx + 1}. {qa.questionTitle}
                </Typography>
                {qa.required && (
                  <Tooltip title="Required">
                    <Typography variant="subtitle1" color="error">
                      *
                    </Typography>
                  </Tooltip>
                )}
              </Stack>
              {qa.questionType === 'INTEGER' &&
                qa.aggregatedData.average !== undefined && (
                  <Box
                    sx={{
                      mt: 1,
                      p: 1,
                      borderRadius: 1,
                      textAlign: 'center',
                      backgroundColor: 'grey.100',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Average Answer: {qa.aggregatedData.average}
                    </Typography>
                    <Typography variant="caption">
                      (from {qa.aggregatedData.count} responses)
                    </Typography>
                  </Box>
                )}
              {(qa.questionType === 'SINGLE_LINE' ||
                qa.questionType === 'MULTI_LINE') &&
                qa.aggregatedData.mostFrequentAnswer && (
                  <Box
                    sx={{
                      mt: 1,
                      p: 1,
                      borderRadius: 1,
                      textAlign: 'center',
                      backgroundColor: 'grey.100',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Most Frequent Answer:
                    </Typography>
                    <Typography variant="body1">
                      {qa.aggregatedData.mostFrequentAnswer || 'N/A'}
                    </Typography>
                  </Box>
                )}
              {qa.questionType === 'CHECKBOX' &&
                qa.aggregatedData.totalCount !== undefined && (
                  <Box sx={{ mt: 1, p: 1, borderRadius: 1 }}>
                    <CheckboxProgressBar
                      checkedCount={qa.aggregatedData.checkedCount}
                      totalCount={qa.aggregatedData.totalCount}
                    />
                  </Box>
                )}
            </Box>
          ))
        : null}
    </Box>
  );
};

export default TemplateAnalyticsTab;
