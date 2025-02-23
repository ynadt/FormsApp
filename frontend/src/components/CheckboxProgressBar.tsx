import React from 'react';
import { Box, Typography } from '@mui/material';

interface CheckboxProgressBarProps {
  checkedCount: number;
  totalCount: number;
}

const CheckboxProgressBar: React.FC<CheckboxProgressBarProps> = ({
  checkedCount,
  totalCount,
}) => {
  const percentage = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;
  return (
    <Box sx={{ mt: 1 }}>
      <Box
        sx={{
          width: '100%',
          height: 10,
          backgroundColor: 'grey.300',
          borderRadius: 1,
          overflow: 'hidden',
          mb: 0.5,
        }}
      >
        <Box
          sx={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: percentage > 50 ? 'success.main' : 'error.main',
          }}
        />
      </Box>
      <Typography variant="caption">
        {checkedCount} checked out of {totalCount}
      </Typography>
    </Box>
  );
};

export default CheckboxProgressBar;
