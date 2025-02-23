import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableQuestion from './SortableQuestion.tsx';
import { NewQuestion } from '../types/template';

interface QuestionManagerProps {
  questions: NewQuestion[];
  onAddQuestion: () => void;
  onRemoveQuestion: (index: number) => void;
  onChangeQuestion: (
    index: number,
    field: keyof NewQuestion,
    value: string | boolean,
  ) => void;
  onReorderQuestions: (newQuestions: NewQuestion[]) => void;
}

const QuestionManager: React.FC<QuestionManagerProps> = ({
  questions,
  onAddQuestion,
  onRemoveQuestion,
  onChangeQuestion,
  onReorderQuestions,
}) => {
  const [activeQuestion, setActiveQuestion] =
    React.useState<NewQuestion | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragStart = (event: any) => {
    const { active } = event;
    const question = questions.find((q) => q.title === active.id);
    if (question) {
      setActiveQuestion(question);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const newQuestions = arrayMove(
        questions,
        questions.findIndex((q) => q.title === active.id),
        questions.findIndex((q) => q.title === over.id),
      );
      onReorderQuestions(newQuestions);
    }
    setActiveQuestion(null);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={questions.map((q, i) => q.title || `q-${i}`)}
          strategy={verticalListSortingStrategy}
        >
          {questions.map((q, index) => (
            <SortableQuestion
              key={index}
              id={q.title || `q-${index}`}
              index={index}
              question={q}
              onChange={onChangeQuestion}
              onRemove={onRemoveQuestion}
            />
          ))}
        </SortableContext>
        <DragOverlay>
          {activeQuestion && (
            <Box
              sx={{
                border: '1px solid #ccc',
                borderRadius: 4,
                padding: 8,
                width: '100%',
              }}
            >
              <Typography>{activeQuestion.title}</Typography>
            </Box>
          )}
        </DragOverlay>
      </DndContext>
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={onAddQuestion}
        sx={{ mt: 2 }}
      >
        Add New Question
      </Button>
    </>
  );
};

export default QuestionManager;
