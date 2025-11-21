import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container, Typography, Box, Alert, Grid, Chip,
    Paper, Divider, ImageList, ImageListItem, Button
} from '@mui/material';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import HomeIcon from '@mui/icons-material/Home';
import { getListing, getAllBookings, makeBooking } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import StarRating from '../components/common/StarRating';
import BookingModal from '../components/bookings/BookingModal';

export default function ViewListing() {
    const { id } = useParams();
    const [listing, setListing] = useState(null);
    const [userBookings, setUserBookings] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const { isAuthenticated } = useAuth();

    const fetchBookings = async () => {
        if (isAuthenticated()) {
            const bookingsData = await getAllBookings();
            const myBookingsForListing = bookingsData.bookings.filter(
                b => b.listingId === id
            );
            setUserBookings(myBookingsForListing);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getListing(id);
                setListing(data.listing);
                await fetchBookings();
                setError('');
            } catch (err) {
                setError(err.message || 'Failed to load listing');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, isAuthenticated]);

    const handleMakeBooking = async (dateRange) => {
        try {
            setError('');
            setSuccess('');
            await makeBooking(id, dateRange);
            setSuccess('Booking request submitted successfully!');
            await fetchBookings();
        } catch (err) {
            setError(err.message || 'Failed to make booking');
        }
    };

    const calculateAverageRating = () => {
        if (!listing?.reviews || listing.reviews.length === 0) return 0;
        const sum = listing.reviews.reduce((acc, review) => acc + review.rating,
            0);
        return sum / listing.reviews.length;
    };

    const getTotalBeds = () => {
        if (!listing?.metadata?.bedrooms) return 0;
        return listing.metadata.bedrooms.reduce((sum, room) => sum + (room.beds
            || 0), 0);
    };

    if (loading) {
        return <Container sx={{
            mt: 4
        }}><Typography>Loading...</Typography></Container>;
    }

    if (error && !listing) {
        return <Container sx={{ mt: 4 }}><Alert
            severity="error">{error}</Alert></Container>;
    }

    if (!listing) {
        return <Container sx={{ mt: 4 }}><Typography>Listing not
            found</Typography></Container>;
    }

    const avgRating = calculateAverageRating();
    const totalBeds = getTotalBeds();
    const allImages = [listing.thumbnail, ...(listing.metadata?.images ||
        [])].filter(Boolean);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    {listing.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <StarRating rating={avgRating} reviewCount={listing.reviews?.length
                        || 0} />
                    <Typography variant="body2" color="text.secondary">
                        {listing.address}
                    </Typography>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {allImages.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <ImageList cols={3} gap={8} sx={{ maxHeight: 400 }}>
                        {allImages.map((image, index) => (
                            <ImageListItem key={index}>
                                <img
                                    src={image}
                                    alt={`${listing.title} ${index + 1}`}
                                    style={{ height: '100%', objectFit: 'cover' }}
                                />
                            </ImageListItem>
                        ))}
                    </ImageList>
                </Box>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <HomeIcon color="action" />
                                <Typography>{listing.metadata?.propertyType ||
                                    'Property'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <BedIcon color="action" />
                                <Typography>{totalBeds} bed{totalBeds !== 1 ? 's' :
                                    ''}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <BathtubIcon color="action" />
                                <Typography>{listing.metadata?.bathrooms || 0}
                                    bath{listing.metadata?.bathrooms !== 1 ? 's' : ''}</Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="h6" gutterBottom>Bedrooms</Typography>
                        {listing.metadata?.bedrooms?.map((bedroom, index) => (
                            <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                                Bedroom {index + 1}: {bedroom.beds} {bedroom.type}
                                bed{bedroom.beds !== 1 ? 's' : ''}
                            </Typography>
                        ))}

                        <Divider sx={{ my: 2 }} />

                        {listing.metadata?.amenities && listing.metadata.amenities.length
                            > 0 && (
                                <>
                                    <Typography variant="h6" gutterBottom>Amenities</Typography>
                                    <Box sx={{
                                        display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2
                                    }}>
                                        {listing.metadata.amenities.map((amenity, index) => (
                                            <Chip key={index} label={amenity} variant="outlined" />
                                        ))}
                                    </Box>
                                </>
                            )}
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Reviews ({listing.reviews?.length || 0})
                        </Typography>
                        {listing.reviews && listing.reviews.length > 0 ? (
                            listing.reviews.map((review, index) => (
                                <Box key={index} sx={{
                                    mb: 2, pb: 2, borderBottom: index <
                                        listing.reviews.length - 1 ? '1px solid #e0e0e0' : 'none'
                                }}>
                                    <StarRating rating={review.rating} />
                                    <Typography variant="body2" sx={{
                                        mt: 1
                                    }}>{review.comment}</Typography>
                                </Box>
                            ))
                        ) : (
                            <Typography variant="body2" color="text.secondary">No reviews
                                yet</Typography>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
                        <Typography variant="h5" gutterBottom>
                            ${listing.price} / night
                        </Typography>

                        {isAuthenticated() && (
                            <Button
                                variant="contained"
                                fullWidth
                                sx={{ mt: 2 }}
                                onClick={() => setBookingModalOpen(true)}
                            >
                                Make a Booking
                            </Button>
                        )}

                        {userBookings.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>Your
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
        </Container>
    );
}
