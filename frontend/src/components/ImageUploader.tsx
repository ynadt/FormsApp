import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import supabase from '../supabase';
import DropZone from './DropZone';
import {
  MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE_UPLOAD,
} from '../constants/constants.ts';

interface ImageUploaderProps {
  initialImageUrl?: string;
  onImageUpload: (url: string) => void;
  onImageDelete: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  initialImageUrl,
  onImageUpload,
  onImageDelete,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialImageUrl || null,
  );
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File): Promise<string> => {
    if (file.size > MAX_FILE_SIZE_UPLOAD) {
      toast.error('Image size exceeds 50 MB limit.');
      throw new Error('File size too large');
    }
    setUploading(true);
    const filePath = `templates/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('formbuilder')
      .upload(filePath, file);
    if (error) {
      setUploading(false);
      throw error;
    }
    const { data: publicUrlData } = supabase.storage
      .from('formbuilder')
      .getPublicUrl(data.path);
    setUploading(false);
    setImagePreview(publicUrlData.publicUrl);
    onImageUpload(publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        if (file.size > MAX_FILE_SIZE_UPLOAD) {
          toast.error(`Image size exceeds ${MAX_FILE_SIZE_MB} MB limit.`);
          return;
        }
        await handleFileUpload(file);
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const handleDeleteImage = () => {
    setImagePreview(null);
    onImageDelete();
  };

  return (
    <>
      {imagePreview ? (
        <Box sx={{ mt: 2 }}>
          <Box
            sx={{
              cursor: 'grab',
              maxWidth: '50%',
              height: 'auto',
              borderRadius: 2,
              border: '2px solid #ddd',
              boxShadow: 1,
            }}
          >
            <img
              src={imagePreview}
              alt="Preview"
              style={{ width: '100%', height: 'auto' }}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('downloadURL', imagePreview);
              }}
            />
          </Box>
          <Button
            variant="outlined"
            color="error"
            onClick={handleDeleteImage}
            sx={{ mt: 1 }}
          >
            Delete Image
          </Button>
        </Box>
      ) : (
        <DropZone onFileDrop={handleFileUpload}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Drag and drop an image here, or click to upload. Max size:{' '}
            {MAX_FILE_SIZE_MB} MB.
          </Typography>
          <Button variant="outlined" component="label">
            {uploading ? 'Uploading…' : 'Upload Image'}
            <input
              type="file"
              hidden
              onChange={handleFileChange}
              accept="image/*"
            />
          </Button>
        </DropZone>
      )}
    </>
  );
};

export default ImageUploader;
