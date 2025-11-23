import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Alert, Box, Typography
} from '@mui/material';

export default function BookingModal({ open, onClose, onBook, listingTitle,
  pricePerNight }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const calculateNights = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleBook = () => {
    setError('');

    if (!startDate || !endDate) {
      setError('Please select both check-in and check-out dates');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError('Check-out date must be after check-in date');
      return;
    }

    onBook({ start: startDate, end: endDate }, totalPrice);
    handleClose();
  };

  const handleClose = () => {
    setStartDate('');
    setEndDate('');
    setError('');
    onClose();
  };

  const nights = calculateNights();

  // Multi-night discount calculation
  const calculateDiscount = (numNights) => {
    if (numNights >= 14) return 0.15; // 15% off for 14+ nights
    if (numNights >= 7) return 0.10;  // 10% off for 7-13 nights
    if (numNights >= 3) return 0.05;  // 5% off for 3-6 nights
    return 0; // No discount for 1-2 nights
  };

  const discount = calculateDiscount(nights);
  const basePrice = nights * pricePerNight;
  const discountAmount = basePrice * discount;
  const totalPrice = basePrice - discountAmount;

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
        Book: {listingTitle}
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

        <TextField
          label="Check-in Date"
          type="date"
          fullWidth
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{
            mt: 2,
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              },
              '&.Mui-focused': {
                boxShadow: '0 2px 12px rgba(255,56,92,0.15)'
              }
            }
          }}
        />

        <TextField
          label="Check-out Date"
          type="date"
          fullWidth
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              },
              '&.Mui-focused': {
                boxShadow: '0 2px 12px rgba(255,56,92,0.15)'
              }
            }
          }}
        />

        {nights > 0 && (
          <Box
            sx={{
              p: 2.5,
              bgcolor: 'rgba(255,56,92,0.04)',
              borderRadius: 2,
              border: '1px solid rgba(255,56,92,0.1)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#717171' }}>
                ${pricePerNight} × {nights} night{nights !== 1 ? 's' : ''}
              </Typography>
              <Typography variant="body2" sx={{ color: '#717171' }}>
                ${basePrice.toFixed(2)}
              </Typography>
            </Box>

            {discount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#00A699', fontWeight: 600 }}>
                  Multi-night discount ({(discount * 100).toFixed(0)}% off)
                </Typography>
                <Typography variant="body2" sx={{ color: '#00A699', fontWeight: 600 }}>
                  -${discountAmount.toFixed(2)}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1.5, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#222' }}>
                Total
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#222' }}>
                ${totalPrice.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        )}
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
          onClick={handleBook}
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
          Confirm Booking
        </Button>
      </DialogActions>
    </Dialog>
  );
}