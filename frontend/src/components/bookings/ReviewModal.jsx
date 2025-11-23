import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Alert, Box, Rating, Typography
} from '@mui/material';

export default function ReviewModal({ open, onClose, onSubmit, listingTitle
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      setError('Please write a comment');
      return;
    }

    onSubmit({ rating, comment });
    handleClose();
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    setError('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2.5,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: '1.5rem',
          color: '#222',
          letterSpacing: '-0.02em',
          pb: 1
        }}
      >
        Leave a Review for {listingTitle}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(211, 47, 47, 0.15)'
            }}
          >
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 2, mb: 3 }}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: '#222',
              fontSize: '0.95rem',
              mb: 1.5
            }}
          >
            Rating
          </Typography>
          <Rating
            value={rating}
            onChange={(event, newValue) => setRating(newValue)}
            size="large"
            sx={{
              '& .MuiRating-iconFilled': {
                color: 'primary.main'
              },
              '& .MuiRating-iconHover': {
                color: 'primary.dark'
              }
            }}
          />
        </Box>

        <TextField
          label="Your Review"
          multiline
          rows={4}
          fullWidth
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this property..."
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              },
              '&.Mui-focused': {
                boxShadow: '0 2px 12px rgba(99, 102, 241, 0.15)'
              }
            }
          }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button
          onClick={handleClose}
          sx={{
            color: '#717171',
            fontWeight: 500,
            textTransform: 'none',
            px: 3,
            py: 1,
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.04)',
              color: '#222'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          sx={{
            fontWeight: 600,
            textTransform: 'none',
            px: 3,
            py: 1,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
              transform: 'translateY(-1px)'
            }
          }}
        >
          Submit Review
        </Button>
      </DialogActions>
    </Dialog>
  );
}