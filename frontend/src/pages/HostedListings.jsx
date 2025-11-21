import { useState, useEffect } from 'react';
import { Container, Grid, Typography, Button, Box, Alert, Chip } from
    '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import { useNavigate } from 'react-router-dom';
import { getAllListings, deleteListing, publishListing, unpublishListing }
    from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ListingCard from '../components/listings/ListingCard';
import PublishModal from '../components/listings/PublishModal';

export default function HostedListings() {
    const [listings, setListings] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [publishModalOpen, setPublishModalOpen] = useState(false);
    const [selectedListing, setSelectedListing] = useState(null);
    const { userEmail } = useAuth();
    const navigate = useNavigate();

    const fetchMyListings = async () => {
        try {
            setLoading(true);
            const data = await getAllListings();
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

    const handlePublishClick = (listing) => {
        setSelectedListing(listing);
        setPublishModalOpen(true);
    };

    const handlePublish = async (availabilities) => {
        try {
            await publishListing(selectedListing.id, availabilities);
            await fetchMyListings();
        } catch (err) {
            setError(err.message || 'Failed to publish listing');
        }
    };

    const handleUnpublish = async (id) => {
        if (!window.confirm('Are you sure you want to unpublish this listing?'))
            return;

        try {
            await unpublishListing(id);
            await fetchMyListings();
        } catch (err) {
            setError(err.message || 'Failed to unpublish listing');
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
                <Typography>You don&apos;t have any listings yet. Create one to get
                    started!</Typography>
            ) : (
                <Grid container spacing={3}>
                    {listings.map((listing) => (
                        <Grid item xs={12} sm={6} md={4} key={listing.id}>
                            <Box>
                                <ListingCard
                                    listing={listing}
                                    onDelete={handleDelete}
                                    isHostView={true}
                                />
                                <Box sx={{
                                    mt: 1, display: 'flex', gap: 1, justifyContent:
                                        'center'
                                }}>
                                    {listing.published ? (
                                        <>
                                            <Chip label="Published" color="success" size="small" />
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="warning"
                                                onClick={() => handleUnpublish(listing.id)}
                                            >
                                                Unpublish
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            size="small"
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handlePublishClick(listing)}
                                        >
                                            Publish
                                        </Button>
                                    )}
                                </Box>
                                {listing.published && (
                                    <Button
                                        fullWidth
                                        size="small"
                                        variant="text"
                                        startIcon={<ManageSearchIcon />}
                                        onClick={() =>
                                            navigate(`/listings/${listing.id}/bookings`)}
                                        sx={{ mt: 1 }}
                                    >
                                        Manage Bookings
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            )}

            <PublishModal
                open={publishModalOpen}
                onClose={() => setPublishModalOpen(false)}
                onPublish={handlePublish}
                listingTitle={selectedListing?.title || ''}
            />
        </Container>
    );
}
