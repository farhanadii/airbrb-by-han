import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Grid, Chip, Dialog, DialogTitle, DialogContent, IconButton, Button, Paper } from '@mui/material';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CloseIcon from '@mui/icons-material/Close';
import { acceptBooking, declineBooking } from '../../services/api';

export default function BookingStats({ bookings, listings, onBookingUpdate }) {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStat, setSelectedStat] = useState(null);
  const [error, setError] = useState('');
  // Filter bookings for the host's listings
  const myListingIds = listings.map(l => String(l.id));
  const myBookings = bookings.filter(b => myListingIds.includes(String(b.listingId)));

  // Calculate statistics
  const pendingCount = myBookings.filter(b => b.status === 'pending').length;
  const acceptedCount = myBookings.filter(b => b.status === 'accepted').length;
  const declinedCount = myBookings.filter(b => b.status === 'declined').length;
  const totalRequests = myBookings.length;

  // Calculate acceptance rate
  const acceptanceRate = totalRequests > 0
    ? ((acceptedCount / totalRequests) * 100).toFixed(1)
    : '0.0';

  // Calculate total earnings from accepted bookings
  const totalEarnings = myBookings
    .filter(b => b.status === 'accepted')
    .reduce((sum, booking) => {
      return sum + (booking.totalPrice || 0);
    }, 0);

  // Get bookings by status for detail view
  const getBookingsByStatus = (status) => {
    const filteredBookings = status === 'all'
      ? myBookings
      : myBookings.filter(b => b.status === status);

    return filteredBookings.map(booking => {
      const listing = listings.find(l => String(l.id) === String(booking.listingId));
      return {
        ...booking,
        listingTitle: listing?.title || 'Unknown Property'
      };
    });
  };

  const handleStatClick = (statType) => {
    setSelectedStat(statType);
    setDialogOpen(true);
    setError('');
  };

  const handleAccept = async (bookingId) => {
    try {
      setError('');
      await acceptBooking(bookingId);
      if (onBookingUpdate) {
        await onBookingUpdate();
      }
    } catch (err) {
      setError(err.message || 'Failed to accept booking');
    }
  };

  const handleDecline = async (bookingId) => {
    try {
      setError('');
      await declineBooking(bookingId);
      if (onBookingUpdate) {
        await onBookingUpdate();
      }
    } catch (err) {
      setError(err.message || 'Failed to decline booking');
    }
  };

  const stats = [
    {
      title: 'Total Requests',
      value: totalRequests,
      icon: <EventAvailableIcon sx={{ fontSize: 40 }} />,
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.1)',
      type: 'all',
      clickable: totalRequests > 0
    },
    {
      title: 'Pending',
      value: pendingCount,
      icon: <PendingActionsIcon sx={{ fontSize: 40 }} />,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      type: 'pending',
      clickable: pendingCount > 0
    },
    {
      title: 'Accepted',
      value: acceptedCount,
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      type: 'accepted',
      clickable: acceptedCount > 0
    },
    {
      title: 'Declined',
      value: declinedCount,
      icon: <CancelIcon sx={{ fontSize: 40 }} />,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      type: 'declined',
      clickable: declinedCount > 0
    },
    {
      title: 'Acceptance Rate',
      value: `${acceptanceRate}%`,
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      type: null,
      clickable: false
    },
    {
      title: 'Total Earnings',
      value: `$${totalEarnings.toFixed(2)}`,
      icon: <AttachMoneyIcon sx={{ fontSize: 40 }} />,
      color: '#059669',
      bgColor: 'rgba(5, 150, 105, 0.1)',
      type: 'accepted',
      clickable: acceptedCount > 0
    }
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#222' }}>
        Booking Statistics
      </Typography>
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Card
              onClick={() => stat.clickable && handleStatClick(stat.type)}
              sx={{
                height: '100%',
                borderRadius: 2.5,
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                cursor: stat.clickable ? 'pointer' : 'default',
                '&:hover': {
                  boxShadow: stat.clickable ? '0 4px 20px rgba(0,0,0,0.12)' : '0 2px 12px rgba(0,0,0,0.08)',
                  transform: stat.clickable ? 'translateY(-4px)' : 'none'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    bgcolor: stat.bgColor,
                    color: stat.color,
                    mb: 2
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: '#222',
                    mb: 0.5
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#717171',
                    fontWeight: 500
                  }}
                >
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Additional insights */}
      {totalRequests > 0 && (
        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {pendingCount > 0 && (
            <Chip
              icon={<PendingActionsIcon />}
              label={`${pendingCount} booking${pendingCount !== 1 ? 's' : ''} awaiting your response`}
              color="warning"
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
          )}
          {acceptedCount > 0 && (
            <Chip
              icon={<CheckCircleIcon />}
              label={`${acceptedCount} confirmed booking${acceptedCount !== 1 ? 's' : ''}`}
              color="success"
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
          )}
          {parseFloat(acceptanceRate) >= 80 && totalRequests >= 5 && (
            <Chip
              icon={<TrendingUpIcon />}
              label="Great acceptance rate!"
              color="info"
              sx={{ fontWeight: 500 }}
            />
          )}
        </Box>
      )}

      {/* Booking Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {selectedStat === 'all' && 'All Booking Requests'}
            {selectedStat === 'pending' && 'Pending Bookings'}
            {selectedStat === 'accepted' && 'Accepted Bookings'}
            {selectedStat === 'declined' && 'Declined Bookings'}
          </Typography>
          <IconButton onClick={() => setDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'error.lighter', borderRadius: 1 }}>
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            </Box>
          )}
          {selectedStat && (
            <Box sx={{ pt: 0 }}>
              {getBookingsByStatus(selectedStat).length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                  No bookings found
                </Typography>
              ) : (
                getBookingsByStatus(selectedStat).map((booking) => (
                  <Paper
                    key={booking.id}
                    sx={{
                      mb: 2,
                      overflow: 'hidden',
                      borderLeft: `4px solid ${
                        booking.status === 'accepted' ? '#10b981' :
                          booking.status === 'pending' ? '#f59e0b' : '#ef4444'
                      }`,
                      backgroundColor: booking.status === 'accepted' ? 'rgba(16, 185, 129, 0.05)' :
                        booking.status === 'pending' ? 'rgba(245, 158, 11, 0.05)' : 'rgba(239, 68, 68, 0.05)'
                    }}
                  >
                    {/* Clickable area to navigate to listing */}
                    <Box
                      onClick={() => navigate(`/listings/${booking.listingId}`)}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        '&:hover': {
                          backgroundColor: booking.status === 'accepted' ? 'rgba(16, 185, 129, 0.1)' :
                            booking.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#222' }}>
                          {booking.listingTitle}
                        </Typography>
                        <Chip
                          label={booking.status.toUpperCase()}
                          size="small"
                          color={
                            booking.status === 'pending' ? 'warning' :
                              booking.status === 'accepted' ? 'success' : 'error'
                          }
                        />
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Guest: {booking.owner}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Dates: {new Date(booking.dateRange.start).toLocaleDateString()} - {new Date(booking.dateRange.end).toLocaleDateString()}
                        </Typography>
                        {booking.totalPrice && (
                          <Typography variant="body2" sx={{ color: '#059669', fontWeight: 600 }}>
                            Total: ${booking.totalPrice.toFixed(2)}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Action buttons for pending bookings */}
                    {booking.status === 'pending' && (
                      <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAccept(booking.id);
                          }}
                          sx={{ minWidth: 100, fontWeight: 600 }}
                        >
                          Accept
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDecline(booking.id);
                          }}
                          sx={{ minWidth: 100, fontWeight: 600 }}
                        >
                          Decline
                        </Button>
                      </Box>
                    )}
                  </Paper>
                ))
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
