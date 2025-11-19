import { useState, useEffect } from 'react';
import { Container, Grid, Typography, Button, Box, Alert } from
    '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { getAllListings, deleteListing } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ListingCard from '../components/listings/ListingCard';

export default function HostedListings() {
    const [listings, setListings] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const { userEmail } = useAuth();
    const navigate = useNavigate();

    const fetchMyListings = async () => {
        try {
            setLoading(true);
            const data = await getAllListings();
            // Filter to only show listings owned by current user
            const myListings = data.listings.filter(listing => listing.owner ===
                userEmail);
            setListings(myListings);
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to load listings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyListings();
    }, [userEmail]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this listing?'))
            return;

        try {
            await deleteListing(id);
            setListings(listings.filter(listing => listing.id !== id));
        } catch (err) {
            setError(err.message || 'Failed to delete listing');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', mb: 3
            }}>
                <Typography variant="h4">My Listings</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/hosted/new')}
                >
                    Create New Listing
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Typography>Loading...</Typography>
            ) : listings.length === 0 ? (
                <Typography>You don't have any listings yet. Create one to get
                    started!</Typography>
            ) : (
                <Grid container spacing={3}>
                    {listings.map((listing) => (
                        <Grid item xs={12} sm={6} md={4} key={listing.id}>
                            <ListingCard
                                listing={listing}
                                onDelete={handleDelete}
                                isHostView={true}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}