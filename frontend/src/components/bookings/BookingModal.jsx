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

    onBook({ start: startDate, end: endDate });
    handleClose();
  };

  const handleClose = () => {
    setStartDate('');
    setEndDate('');
    setError('');
    onClose();
  };

  const nights = calculateNights();
  const totalPrice = nights * pricePerNight;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Book: {listingTitle}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TextField
          label="Check-in Date"
          type="date"
          fullWidth
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mt: 2, mb: 2 }}
        />

        <TextField
          label="Check-out Date"
          type="date"
          fullWidth
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />

        {nights > 0 && (
          <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2">
              {nights} night{nights !== 1 ? 's' : ''} × ${pricePerNight} =
                            ${totalPrice.toFixed(2)}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleBook} variant="contained">
                    Confirm Booking
        </Button>
      </DialogActions>
    </Dialog>
  );
}