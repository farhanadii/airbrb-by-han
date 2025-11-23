import { useState, useEffect } from 'react';
import { Container, Grid, Typography, Button, Box, Alert, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllListings, getListing, deleteListing, publishListing, unpublishListing, getAllBookings, createListing } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ListingCard from '../components/listings/ListingCard';
import ProfitsGraph from '../components/listings/ProfitsGraph';

export default function HostedListings() {
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const { userEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const data = await getAllListings();
      const myListings = data.listings.filter(listing => listing.owner === userEmail);

      // Fetch full details to get published status and availability
      const listingsWithDetails = await Promise.all(
        myListings.map(async (listing) => {
          try {
            const details = await getListing(listing.id);
            return { ...listing, ...details.listing };
          } catch {
            return listing;
          }
        })
      );

      setListings(listingsWithDetails);

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

  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    try {
      await deleteListing(id);
      setListings(listings.filter(listing => listing.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete listing');
    }
  };

  const handlePublishClick = async (listing) => {
    try {
      // Use stored availability dates from metadata
      if (listing.metadata?.availabilityStart && listing.metadata?.availabilityEnd) {
        const availabilities = [{
          start: listing.metadata.availabilityStart,
          end: listing.metadata.availabilityEnd
        }];
        await publishListing(listing.id, availabilities);
        await fetchMyListings();
        setSuccess('Listing published successfully!');
      } else {
        setError('Please edit the listing to add availability dates first');
      }
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
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: 4, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ mb: 1 }}>
          My Listings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage your properties and track your earnings
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/hosted/new')}
            size="large"
          >
            Create New Listing
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            component="label"
            size="large"
          >
            Upload JSON
            <input
              type="file"
              hidden
              accept=".json"
              onChange={handleJsonUpload}
            />
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {!loading && listings.some(l => !l.published) && (
        <Alert severity="info" sx={{ mb: 2 }}>
          💡 <strong>Tip:</strong> Your unpublished listings won&apos;t be visible to guests. Click &quot;Publish&quot; to make them available for booking!
        </Alert>
      )}

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
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {listings.map((listing) => (
            <Grid item xs={12} sm={6} md={4} key={listing.id}>
              <Box>
                <ListingCard
                  listing={listing}
                  onDelete={handleDelete}
                  isHostView={true}
                />
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {listing.published ? (
                    <>
                      <Chip
                        label="Live"
                        color="success"
                        size="medium"
                        sx={{ fontWeight: 600, alignSelf: 'center' }}
                      />
                      <Button
                        fullWidth
                        variant="text"
                        startIcon={<ManageSearchIcon />}
                        onClick={() => navigate(`/listings/${listing.id}/bookings`)}
                      >
                        Manage Bookings
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="warning"
                        onClick={() => handleUnpublish(listing.id)}
                        sx={{ fontSize: '0.875rem' }}
                      >
                        Unpublish
                      </Button>
                    </>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handlePublishClick(listing)}
                    >
                      Publish Listing
                    </Button>
                  )}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
