import { useState, useEffect } from 'react';
import { Container, Grid, Typography, Button, Box, Alert, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import { useNavigate } from 'react-router-dom';
import { getAllListings, deleteListing, publishListing, unpublishListing, getAllBookings, createListing } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ListingCard from '../components/listings/ListingCard';
import PublishModal from '../components/listings/PublishModal';
import ProfitsGraph from '../components/listings/ProfitsGraph';

export default function HostedListings() {
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const { userEmail } = useAuth();
  const navigate = useNavigate();

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const data = await getAllListings();
      const myListings = data.listings.filter(listing => listing.owner === userEmail);
      setListings(myListings);

      const bookingsData = await getAllBookings();
      setBookings(bookingsData.bookings);

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
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

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
    if (!window.confirm('Are you sure you want to unpublish this listing?')) return;

    try {
      await unpublishListing(id);
      await fetchMyListings();
    } catch (err) {
      setError(err.message || 'Failed to unpublish listing');
    }
  };

  const handleJsonUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setError('');
        setSuccess('');

        const jsonData = JSON.parse(event.target.result);

        // Validate JSON structure
        if (!jsonData.title || !jsonData.address || !jsonData.price) {
          setError('Invalid JSON: Missing required fields (title, address, price)');
          return;
        }

        if (!jsonData.metadata || !jsonData.metadata.bedrooms) {
          setError('Invalid JSON: Missing metadata or bedrooms');
          return;
        }

        // Create listing from JSON
        await createListing(jsonData);
        setSuccess('Listing created successfully from JSON!');
        await fetchMyListings();
      } catch (err) {
        if (err instanceof SyntaxError) {
          setError('Invalid JSON file format');
        } else {
          setError(err.message || 'Failed to create listing from JSON');
        }
      }
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Listings</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            component="label"
          >
                        Upload JSON
            <input
              type="file"
              hidden
              accept=".json"
              onChange={handleJsonUpload}
            />
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/hosted/new')}
          >
                        Create New Listing
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {!loading && listings.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <ProfitsGraph bookings={bookings} listings={listings} />
        </Box>
      )}

      {loading ? (
        <Typography>Loading...</Typography>
      ) : listings.length === 0 ? (
        <Typography>You don&apos;t have any listings yet. Create one to get started!</Typography>
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
                <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'center' }}>
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
                    onClick={() => navigate(`/listings/${listing.id}/bookings`)}
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
