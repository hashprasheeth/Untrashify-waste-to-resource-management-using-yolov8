import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';

const UploadBox = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.default,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

function ImageUpload({ onImageUpload, loading }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      // Only accept the first image
      if (acceptedFiles && acceptedFiles.length > 0) {
        onImageUpload(acceptedFiles[0]);
      }
    },
    [onImageUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    maxFiles: 1,
    disabled: loading,
  });

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        E-Waste Detection
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Upload an image of e-waste items to detect objects and get recycling suggestions.
      </Typography>

      <UploadBox
        {...getRootProps()}
        sx={{
          opacity: loading ? 0.7 : 1,
          pointerEvents: loading ? 'none' : 'auto',
        }}
      >
        <input {...getInputProps()} />
        {loading ? (
          <CircularProgress size={50} />
        ) : (
          <>
            <CloudUploadIcon
              color="primary"
              sx={{ fontSize: 60, mb: 2 }}
            />
            <Typography variant="h6" align="center">
              {isDragActive
                ? 'Drop the image here'
                : 'Drag & drop an image here, or click to select'}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 1 }}
            >
              Supported formats: JPEG, PNG
            </Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              disableElevation
            >
              Select Image
            </Button>
          </>
        )}
      </UploadBox>
    </Box>
  );
}

export default ImageUpload; 