import React from 'react';
import {
  Box,
  Stack,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { NewQuestion } from '../types/template';

interface SortableQuestionProps {
  id: string;
  index: number;
  question: NewQuestion;
  onChange: (
    index: number,
    field: keyof NewQuestion,
    value: string | boolean,
  ) => void;
  onRemove: (index: number) => void;
}

const SortableQuestion: React.FC<SortableQuestionProps> = ({
  id,
  index,
  question,
  onChange,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: '1px solid #ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    display: 'flex',
    flexDirection: 'column' as const,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box ref={setNodeRef} style={style}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton {...listeners} {...attributes} size="small">
          <DragIndicatorIcon />
        </IconButton>
        <TextField
          label="Question Title"
          value={question.title}
          onChange={(e) => onChange(index, 'title', e.target.value)}
          required
          fullWidth
        />
        <IconButton onClick={() => onRemove(index)} color="error" size="small">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>
      <TextField
        label="Description (optional)"
        value={question.description || ''}
        onChange={(e) => onChange(index, 'description', e.target.value)}
        fullWidth
        multiline
        rows={2}
        sx={{ mt: 1 }}
      />
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id={`question-type-label-${index}`}>Type</InputLabel>
          <Select
            labelId={`question-type-label-${index}`}
            value={question.type}
            label="Type"
            onChange={(e) =>
              onChange(index, 'type', e.target.value as NewQuestion['type'])
            }
          >
            <MenuItem value="SINGLE_LINE">Single Line</MenuItem>
            <MenuItem value="MULTI_LINE">Multi Line</MenuItem>
            <MenuItem value="INTEGER">Integer</MenuItem>
            <MenuItem value="CHECKBOX">Checkbox</MenuItem>
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Checkbox
              checked={question.required}
              onChange={(e) => onChange(index, 'required', e.target.checked)}
            />
          }
          label="Required"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={question.showInResults}
              onChange={(e) =>
                onChange(index, 'showInResults', e.target.checked)
              }
            />
          }
          label="Show in Results"
        />
      </Stack>
    </Box>
  );
};

export default SortableQuestion;
