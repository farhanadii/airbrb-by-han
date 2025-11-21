import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Alert, Paper,
  List, ListItem, Button, Chip, Divider
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
          <List>
            {bookings.map((booking, index) => (
              <Box key={booking.id}>
                <ListItem sx={{
                  flexDirection: 'column', alignItems:
                                        'flex-start', py: { xs: 1.5, sm: 2 }
                }}>
                  <Box sx={{
                    width: '100%', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent:
                                            'space-between', gap: { xs: 1, sm: 0 }, mb: 1
                  }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {new
                        Date(booking.dateRange.start).toLocaleDateString()} - {new
                        Date(booking.dateRange.end).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                                Guest: {booking.owner}
                      </Typography>
                    </Box>
                    <Chip
                      label={booking.status.toUpperCase()}
                      color={booking.status === 'accepted' ? 'success' :
                        booking.status === 'pending' ? 'warning' : 'default'}
                      size="small"
                    />
                  </Box>

                  {booking.status === 'pending' && (
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mt: 1, width: { xs: '100%', sm: 'auto' } }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handleAccept(booking.id)}
                        fullWidth={{ xs: true, sm: false }}
                      >
                                                Accept
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleDecline(booking.id)}
                        fullWidth={{ xs: true, sm: false }}
                      >
                                                Decline
                      </Button>
                    </Box>
                  )}
                </ListItem>
                {index < bookings.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
}
