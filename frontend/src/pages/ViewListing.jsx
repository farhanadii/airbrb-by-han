import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Typography, Box, Alert, Grid, Chip,
  Paper, Divider, Button
} from '@mui/material';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import HomeIcon from '@mui/icons-material/Home';
import { getListing, getAllBookings, makeBooking, leaveReview } from
  '../services/api';
import { useAuth } from '../contexts/AuthContext';
import RatingBreakdown from '../components/common/RatingBreakdown';
import BookingModal from '../components/bookings/BookingModal';
import ReviewModal from '../components/bookings/ReviewModal';
import ImageGallery from '../components/listings/ImageGallery';

export default function ViewListing() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getListing(id);
        setListing(data.listing);

        if (isAuthenticated()) {
          const bookingsData = await getAllBookings();
          const myBookingsForListing = bookingsData.bookings.filter(
            b => b.listingId === id
          );
          setUserBookings(myBookingsForListing);
        }

        setError('');
      } catch (err) {
        setError(err.message || 'Failed to load listing');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated]);

  const handleMakeBooking = async (dateRange, totalPrice) => {
    try {
      setError('');
      setSuccess('');
      await makeBooking(id, dateRange, totalPrice);
      setSuccess('Booking request submitted successfully!');

      if (isAuthenticated()) {
        const bookingsData = await getAllBookings();
        const myBookingsForListing = bookingsData.bookings.filter(
          b => b.listingId === id
        );
        setUserBookings(myBookingsForListing);
      }
    } catch (err) {
      setError(err.message || 'Failed to make booking');
    }
  };

  const handleLeaveReview = async (review) => {
    try {
      setError('');
      setSuccess('');

      const acceptedBooking = userBookings.find(b => b.status ===
  'accepted');
      if (!acceptedBooking) {
        setError('You can only leave a review after your booking is accepted');
        return;
      }

      await leaveReview(id, acceptedBooking.id, review);
      setSuccess('Review submitted successfully!');

      const data = await getListing(id);
      setListing(data.listing);
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    }
  };

  const getTotalBeds = () => {
    if (!listing?.metadata?.bedrooms) return 0;
    return listing.metadata.bedrooms.reduce((sum, room) => sum + (room.beds
  || 0), 0);
  };

  const hasAcceptedBooking = userBookings.some(b => b.status === 'accepted');

  if (loading) {
    return <Container sx={{ px: { xs: 2, sm: 3 }, mt: { xs: 2, sm: 3, md: 4 }
    }}><Typography>Loading...</Typography></Container>;
  }

  if (error && !listing) {
    return <Container sx={{ px: { xs: 2, sm: 3 }, mt: { xs: 2, sm: 3, md: 4 } }}><Alert
      severity="error">{error}</Alert></Container>;
  }

  if (!listing) {
    return <Container sx={{ px: { xs: 2, sm: 3 }, mt: { xs: 2, sm: 3, md: 4 } }}><Typography>Listing not
  found</Typography></Container>;
  }

  const totalBeds = getTotalBeds();
  const allImages = [listing.thumbnail, ...(listing.metadata?.images ||
        [])].filter(Boolean);
  const isYouTube = listing.thumbnail?.includes('youtube.com');

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, mt: { xs: 2, sm: 3, md: 4 }, mb: { xs: 3, sm: 4 } }}>
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
          {listing.title}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 1, sm: 2 } }}>
          <RatingBreakdown reviews={listing.reviews || []} />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            {listing.address}
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {allImages.length > 0 && (
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          {isYouTube && allImages.length === 1 ? (
            <Box sx={{ width: '100%', height: { xs: 250, sm: 350, md: 400 } }}>
              <iframe
                width="100%"
                height="100%"
                src={listing.thumbnail}
                title={listing.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write;
  encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </Box>
          ) : (
            <ImageGallery images={allImages} title={listing.title} />
          )}
        </Box>
      )}

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HomeIcon color="action" />
                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{listing.metadata?.propertyType ||
                                    'Property'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BedIcon color="action" />
                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{totalBeds} bed{totalBeds !== 1 ? 's' :
                  ''}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BathtubIcon color="action" />
                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{listing.metadata?.bathrooms || 0}
                                    bath{listing.metadata?.bathrooms !== 1 ? 's' : ''}</Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Bedrooms</Typography>
            {listing.metadata?.bedrooms?.map((bedroom, index) => (
              <Typography key={index} variant="body2" sx={{ mb: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                Bedroom {index + 1}: {bedroom.beds} {bedroom.type}
                                bed{bedroom.beds !== 1 ? 's' : ''}
              </Typography>
            ))}

            <Divider sx={{ my: 2 }} />

            {listing.metadata?.amenities && listing.metadata.amenities.length
                            > 0 && (
              <>
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Amenities</Typography>
                <Box sx={{
                  display: 'flex', flexWrap: 'wrap', gap: { xs: 0.5, sm: 1 }, mb: 2
                }}>
                  {listing.metadata.amenities.map((amenity, index) => (
                    <Chip key={index} label={amenity} variant="outlined" size="small" />
                  ))}
                </Box>
              </>
            )}
          </Paper>

          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{
              display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 1, sm: 0 }, mb: 2
            }}>
              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                Reviews ({listing.reviews?.length || 0})
              </Typography>
              {isAuthenticated() && hasAcceptedBooking && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setReviewModalOpen(true)}
                >
                                    Leave Review
                </Button>
              )}
            </Box>
            {listing.reviews && listing.reviews.length > 0 ? (
              listing.reviews.map((review, index) => (
                <Box key={index} sx={{
                  mb: 2, pb: 2, borderBottom: index <
                                        listing.reviews.length - 1 ? '1px solid #e0e0e0' : 'none'
                }}>
                  <RatingBreakdown reviews={[review]} />
                  <Typography variant="body2" sx={{
                    mt: 1, fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}>{review.comment}</Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>No reviews
                                yet</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, position: { md: 'sticky' }, top: 20 }}>
            <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.5rem' } }}>
                            ${listing.price} / night
            </Typography>

            {isAuthenticated() && (
              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{ mt: 2 }}
                onClick={() => setBookingModalOpen(true)}
              >
                                Make a Booking
              </Button>
            )}

            {userBookings.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '0.875rem' } }}>Your
                                    Bookings:</Typography>
                {userBookings.map((booking, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Chip
                      label={`${booking.status.toUpperCase()}: ${new
                      Date(booking.dateRange.start).toLocaleDateString()} - ${new
                      Date(booking.dateRange.end).toLocaleDateString()}`}
                      size="small"
                      color={booking.status === 'accepted' ? 'success' :
                        booking.status === 'pending' ? 'warning' : 'default'}
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <BookingModal
        open={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onBook={handleMakeBooking}
        listingTitle={listing.title}
        pricePerNight={listing.price}
      />

      <ReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={handleLeaveReview}
        listingTitle={listing.title}
      />
    </Container>
  );
}
