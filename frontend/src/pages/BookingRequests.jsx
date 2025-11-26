import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Alert, Paper,
  List, Button, Chip
} from '@mui/material';
import { getListing, getAllBookings, acceptBooking, declineBooking } from
  '../services/api';

export default function BookingRequests() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const listingData = await getListing(id);
      setListing(listingData.listing);

      const bookingsData = await getAllBookings();
      const listingBookings = bookingsData.bookings.filter(b => b.listingId
                === id);
      setBookings(listingBookings);

      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load booking requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAccept = async (bookingId) => {
    try {
      await acceptBooking(bookingId);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to accept booking');
    }
  };

  const handleDecline = async (bookingId) => {
    try {
      await declineBooking(bookingId);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to decline booking');
    }
  };

  const calculateDaysBooked = () => {
    const currentYear = new Date().getFullYear();
    const acceptedBookings = bookings.filter(b => b.status === 'accepted');

    let totalDays = 0;
    acceptedBookings.forEach(booking => {
      const start = new Date(booking.dateRange.start);
      const end = new Date(booking.dateRange.end);

      if (start.getFullYear() === currentYear || end.getFullYear() ===
                currentYear) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalDays += diffDays;
      }
    });

    return totalDays;
  };

  const calculateProfit = () => {
    const currentYear = new Date().getFullYear();
    const acceptedBookings = bookings.filter(b => b.status === 'accepted');

    let totalProfit = 0;
    acceptedBookings.forEach(booking => {
      const start = new Date(booking.dateRange.start);
      const end = new Date(booking.dateRange.end);

      if (start.getFullYear() === currentYear || end.getFullYear() ===
                currentYear) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalProfit += diffDays * (listing?.price || 0);
      }
    });

    return totalProfit;
  };

  const getDaysOnline = () => {
    if (!listing?.postedOn) return 0;
    const posted = new Date(listing.postedOn);
    const now = new Date();
    const diffTime = Math.abs(now - posted);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return <Container sx={{
      px: { xs: 2, sm: 3 }, mt: { xs: 2, sm: 3, md: 4 }
    }}><Typography>Loading...</Typography></Container>;
  }

  if (!listing) {
    return <Container sx={{ px: { xs: 2, sm: 3 }, mt: { xs: 2, sm: 3, md: 4 } }}><Typography>Listing not
            found</Typography></Container>;
  }

  const daysBooked = calculateDaysBooked();
  const profit = calculateProfit();
  const daysOnline = getDaysOnline();

  return (
    <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 }, mt: { xs: 2, sm: 3, md: 4 }, mb: { xs: 3, sm: 4 } }}>
      <Button onClick={() => navigate('/hosted')} sx={{ mb: 2 }} size="small">
                ← Back to My Listings
      </Button>

      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                Booking Requests: {listing.title}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Listing Statistics</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0.5, sm: 1 } }}>
          <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Days online: {daysOnline}</Typography>
          <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Days booked this year:
            {daysBooked}</Typography>
          <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Profit this year:
                        ${profit.toFixed(2)}</Typography>
        </Box>
      </Paper>

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    Booking Requests ({bookings.length})
        </Typography>

        {bookings.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>No booking
                        requests yet</Typography>
        ) : (
          <List sx={{ p: 0 }}>
            {bookings.map((booking) => (
              <Box key={booking.id}>
                <Paper
                  sx={{
                    mb: 2,
                    borderLeft: `4px solid ${
                      booking.status === 'accepted' ? '#10b981' :
                        booking.status === 'pending' ? '#f59e0b' : '#ef4444'
                    }`,
                    backgroundColor: booking.status === 'accepted' ? 'rgba(16, 185, 129, 0.05)' :
                      booking.status === 'pending' ? 'rgba(245, 158, 11, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Clickable area - navigates to listing */}
                  <Box
                    onClick={() => navigate(`/listings/${id}`)}
                    sx={{
                      p: 2.5,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      '&:hover': {
                        backgroundColor: booking.status === 'accepted' ? 'rgba(16, 185, 129, 0.1)' :
                          booking.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                      }
                    }}
                  >
                    <Box sx={{
                      display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent:
                                              'space-between', gap: { xs: 1, sm: 0 }, mb: 1.5
                    }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, fontWeight: 600, mb: 0.5 }}>
                          {new
                          Date(booking.dateRange.start).toLocaleDateString()} - {new
                          Date(booking.dateRange.end).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Guest: {booking.owner}
                        </Typography>
                        {booking.totalPrice && (
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: '#059669', fontWeight: 600, mt: 0.5 }}>
                            Total: ${booking.totalPrice.toFixed(2)}
                          </Typography>
                        )}
                      </Box>
                      <Chip
                        label={booking.status.toUpperCase()}
                        color={booking.status === 'accepted' ? 'success' :
                          booking.status === 'pending' ? 'warning' : 'error'}
                        size="small"
                        sx={{ height: 24 }}
                      />
                    </Box>

                    {booking.status !== 'pending' && (
                      <Typography variant="caption" sx={{ color: '#717171', display: 'block' }}>
                        {booking.status === 'accepted' && 'You accepted this booking request'}
                        {booking.status === 'declined' && 'You declined this booking request'}
                      </Typography>
                    )}
                  </Box>

                  {/* Action buttons - not clickable for navigation */}
                  {booking.status === 'pending' && (
                    <Box sx={{ p: 2.5, pt: 0 }}>
                      <Typography variant="caption" sx={{ color: '#f59e0b', display: 'block', mb: 1.5, fontWeight: 500 }}>
                        New booking request - Action required
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAccept(booking.id);
                          }}
                          sx={{
                            minWidth: 120,
                            fontWeight: 600,
                            py: 1
                          }}
                        >
                          Accept Booking
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDecline(booking.id);
                          }}
                          sx={{
                            minWidth: 120,
                            fontWeight: 600,
                            py: 1
                          }}
                        >
                          Decline
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Box>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
}
