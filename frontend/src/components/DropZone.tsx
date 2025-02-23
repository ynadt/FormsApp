import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Box } from '@mui/material';

const DropZone: React.FC<{
  onFileDrop: (file: File) => void;
  children: React.ReactNode;
}> = ({ onFileDrop, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'drop-zone',
  });

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onFileDrop(file);
    }
  };

  return (
    <Box
      ref={setNodeRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      sx={{
        border: isOver ? '2px dashed #1976d2' : '2px dashed #ccc',
        borderRadius: 2,
        padding: 2,
        textAlign: 'center',
        backgroundColor: isOver
          ? 'rgba(25, 118, 210, 0.1)'
          : 'background.paper',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </Box>
  );
};

export default DropZone;
