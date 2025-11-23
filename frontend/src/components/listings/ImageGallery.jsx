import { useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export default function ImageGallery({ images, title }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <Box sx={{
        width: '100%',
        height: 400,
        bgcolor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 3
      }}>
        <Typography color="text.secondary">No images available</Typography>
      </Box>
    );
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden' }}>
      {/* Main Image */}
      <Box
        component="img"
        src={images[currentIndex]}
        alt={`${title} - Image ${currentIndex + 1}`}
        sx={{
          width: '100%',
          height: { xs: 300, sm: 400, md: 500 },
          objectFit: 'cover',
          display: 'block'
        }}
      />

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <IconButton
            onClick={handlePrevious}
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: 'white' },
              boxShadow: 2
            }}
          >
            <ChevronLeftIcon />
          </IconButton>

          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: 'white' },
              boxShadow: 2
            }}
          >
            <ChevronRightIcon />
          </IconButton>

          {/* Image Counter */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              bgcolor: 'rgba(0,0,0,0.6)',
              color: 'white',
              px: 2,
              py: 1,
              borderRadius: 2,
              fontSize: '0.875rem',
              fontWeight: 600
            }}
          >
            {currentIndex + 1} / {images.length}
          </Box>
        </>
      )}

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <Box sx={{
          display: 'flex',
          gap: 1,
          mt: 2,
          overflowX: 'auto',
          pb: 1,
          '&::-webkit-scrollbar': { height: 8 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: '#ccc',
            borderRadius: 4
          }
        }}>
          {images.map((img, index) => (
            <Box
              key={index}
              component="img"
              src={img}
              alt={`Thumbnail ${index + 1}`}
              onClick={() => setCurrentIndex(index)}
              sx={{
                width: 80,
                height: 80,
                objectFit: 'cover',
                borderRadius: 1,
                cursor: 'pointer',
                border: currentIndex === index ? '3px solid' : '2px solid transparent',
                borderColor: currentIndex === index ? 'primary.main' : 'transparent',
                opacity: currentIndex === index ? 1 : 0.6,
                transition: 'all 0.2s',
                flexShrink: 0,
                '&:hover': {
                  opacity: 1,
                  transform: 'scale(1.05)'
                }
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
