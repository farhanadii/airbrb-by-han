import { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Alert } from '@mui/material';
import { getAllListings, getAllBookings } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ListingCard from '../components/listings/ListingCard';

export default function AllListings() {
    const [listings, setListings] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, userEmail } = useAuth();

    useEffect(() => {
        const fetchListings = async () => {
            try {
                setLoading(true);
                const data = await getAllListings();

                // Only show published listings
                let publishedListings = data.listings.filter(listing =>
                    listing.published);

                // If user is logged in, prioritize listings with their bookings
                if (isAuthenticated()) {
                    const bookingsData = await getAllBookings();
                    const userBookings = bookingsData.bookings;

                    // Get listing IDs where user has accepted or pending bookings
                    const bookedListingIds = userBookings
                        .filter(b => b.status === 'accepted' || b.status === 'pending')
                        .map(b => b.listingId);

                    // Sort: booked listings first, then alphabetically by title
                    publishedListings.sort((a, b) => {
                        const aBooked = bookedListingIds.includes(a.id);
                        const bBooked = bookedListingIds.includes(b.id);

                        if (aBooked && !bBooked) return -1;
                        if (!aBooked && bBooked) return 1;
                        return a.title.localeCompare(b.title);
                    });
                } else {
                    // Not logged in: just sort alphabetically
                    publishedListings.sort((a, b) => a.title.localeCompare(b.title));
                }

                setListings(publishedListings);
                setError('');
            } catch (err) {
                setError(err.message || 'Failed to load listings');
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [isAuthenticated, userEmail]);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    All Listings
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Discover amazing places to stay
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Typography>Loading...</Typography>
            ) : listings.length === 0 ? (
                <Typography>No listings available at the moment.</Typography>
            ) : (
                <Grid container spacing={3}>
                    {listings.map((listing) => (
                        <Grid item xs={12} sm={6} md={4} key={listing.id}>
                            <ListingCard listing={listing} isHostView={false} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}