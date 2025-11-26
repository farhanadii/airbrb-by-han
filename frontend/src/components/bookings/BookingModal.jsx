import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Alert, Box, Typography
} from '@mui/material';

export default function BookingModal({ open, onClose, onBook, listingTitle,
  pricePerNight, discountSettings = {}, availabilityStart = '', availabilityEnd = '', existingBookings = [] }) {
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

  // Check if date range overlaps with existing accepted/pending bookings
  const checkDateOverlap = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    for (const booking of existingBookings) {
      // Only check accepted and pending bookings
      if (booking.status !== 'accepted' && booking.status !== 'pending') continue;

      const bookingStart = new Date(booking.dateRange.start);
      const bookingEnd = new Date(booking.dateRange.end);

      // Check if dates overlap
      if (startDate < bookingEnd && endDate > bookingStart) {
        return true;
      }
    }
    return false;
  };

  // Get today's date in YYYY-MM-DD format for comparison (using local timezone)
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

    // Check if start date is in the past
    if (startDate < getTodayString()) {
      setError('Check-in date cannot be in the past');
      return;
    }

    // Check if dates are within availability range
    if (availabilityStart && startDate < availabilityStart) {
      setError(`This property is only available from ${new Date(availabilityStart).toLocaleDateString()}`);
      return;
    }

    if (availabilityEnd && endDate > availabilityEnd) {
      setError(`This property is only available until ${new Date(availabilityEnd).toLocaleDateString()}`);
      return;
    }

    // Check if dates overlap with existing bookings
    if (checkDateOverlap(startDate, endDate)) {
      setError('These dates are not available. Please choose different dates.');
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

  // Multi-night discount calculation using listing's custom discount tiers
  const calculateDiscount = (numNights) => {
    console.log('=== DISCOUNT CALCULATION ===');
    console.log('numNights:', numNights);
    console.log('discountSettings:', discountSettings);

    // Only apply discounts if the host has explicitly enabled them
    if (!discountSettings || discountSettings.discountsEnabled === false) {
      console.log('Discounts NOT enabled - returning 0');
      return 0;
    }

    // Check if there are any valid custom discount tiers
    const hasValidCustomDiscounts = discountSettings.customDiscounts &&
      discountSettings.customDiscounts.length > 0 &&
      discountSettings.customDiscounts.some(tier =>
        tier.minNights > 0 && tier.discount > 0
      );

    // If discountsEnabled is true but no valid custom discounts, return 0
    if (!hasValidCustomDiscounts && discountSettings.discountsEnabled === true) {
      console.log('Discounts enabled but no valid custom discounts - returning 0');
      return 0;
    }

    // If using new custom discount tiers
    if (hasValidCustomDiscounts) {
      console.log('Using custom discount tiers');
      // Find the best matching tier (highest discount that applies)
      let bestDiscount = 0;

      for (const tier of discountSettings.customDiscounts) {
        // Skip invalid tiers - check for valid numbers
        if (!tier.minNights || tier.minNights <= 0 || !tier.discount || tier.discount <= 0) {
          console.log('Skipping invalid tier:', tier);
          continue;
        }

        const meetsMin = numNights >= tier.minNights;
        const meetsMax = tier.maxNights === null || tier.maxNights === '' || numNights <= tier.maxNights;

        console.log(`Tier check:`, { tier, meetsMin, meetsMax });

        if (meetsMin && meetsMax && tier.discount > bestDiscount) {
          bestDiscount = tier.discount;
        }
      }

      console.log('Best discount found:', bestDiscount);
      return bestDiscount / 100;
    }

    console.log('No discounts applied - returning 0');
    return 0;
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
          inputProps={{
            min: availabilityStart && availabilityStart > getTodayString() ? availabilityStart : getTodayString(),
            max: availabilityEnd || undefined
          }}
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
          inputProps={{
            min: startDate || (availabilityStart && availabilityStart > getTodayString() ? availabilityStart : getTodayString()),
            max: availabilityEnd || undefined
          }}
          helperText="Booked dates will be validated on confirmation"
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