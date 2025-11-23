import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, TextField, IconButton, Typography, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export default function PublishModal({ open, onClose, onPublish,
  listingTitle }) {
  const [availabilities, setAvailabilities] = useState([
    { start: '', end: '' }
  ]);
  const [error, setError] = useState('');

  const addAvailability = () => {
    setAvailabilities([...availabilities, { start: '', end: '' }]);
  };

  const removeAvailability = (index) => {
    setAvailabilities(availabilities.filter((_, i) => i !== index));
  };

  const updateAvailability = (index, field, value) => {
    const updated = [...availabilities];
    updated[index] = { ...updated[index], [field]: value };
    setAvailabilities(updated);
  };

  const handlePublish = () => {
    setError('');

    // Validation
    if (availabilities.length === 0) {
      setError('Please add at least one availability range');
      return;
    }

    for (let i = 0; i < availabilities.length; i++) {
      const { start, end } = availabilities[i];
      if (!start || !end) {
        setError(`Please fill in both start and end dates for availability 
  ${i + 1}`);
        return;
      }
      if (new Date(start) >= new Date(end)) {
        setError(`End date must be after start date for availability ${i +
                    1}`);
        return;
      }
    }

    // Format as required by backend
    const formattedAvailabilities = availabilities.map(av => ({
      start: av.start,
      end: av.end
    }));

    onPublish(formattedAvailabilities);
    handleClose();
  };

  const handleClose = () => {
    setAvailabilities([{ start: '', end: '' }]);
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
        Publish Listing: {listingTitle}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 3,
            fontSize: '0.95rem',
            lineHeight: 1.6
          }}
        >
          Set availability date ranges for when this property can be booked.
        </Typography>

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

        {availabilities.map((availability, index) => (
          <Box
            key={index}
            sx={{
              mb: 2,
              p: 2.5,
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 2,
              bgcolor: 'rgba(0,0,0,0.02)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: '#222',
                  fontSize: '0.95rem'
                }}
              >
                Availability Range {index + 1}
              </Typography>
              {availabilities.length > 1 && (
                <IconButton
                  size="small"
                  onClick={() => removeAvailability(index)}
                  sx={{
                    color: 'error.main',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(193, 53, 21, 0.08)',
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                value={availability.start}
                onChange={(e) => updateAvailability(index, 'start', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&.Mui-focused': {
                      boxShadow: '0 2px 8px rgba(99, 102, 241, 0.12)'
                    }
                  }
                }}
              />
              <TextField
                label="End Date"
                type="date"
                value={availability.end}
                onChange={(e) => updateAvailability(index, 'end', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&.Mui-focused': {
                      boxShadow: '0 2px 8px rgba(99, 102, 241, 0.12)'
                    }
                  }
                }}
              />
            </Box>
          </Box>
        ))}

        <Button
          startIcon={<AddIcon />}
          onClick={addAvailability}
          variant="outlined"
          fullWidth
          sx={{
            mt: 1,
            py: 1.5,
            borderRadius: 2,
            borderColor: 'rgba(0,0,0,0.12)',
            color: '#717171',
            fontWeight: 500,
            textTransform: 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'primary.main',
              color: 'primary.main',
              bgcolor: 'rgba(99, 102, 241, 0.04)'
            }
          }}
        >
          Add Another Date Range
        </Button>
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
          onClick={handlePublish}
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
          Publish Listing
        </Button>
      </DialogActions>
    </Dialog>
  );
}
