import { useState, useEffect } from 'react';
import { Container, Grid, Typography, Button, Box, Alert, Chip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Snackbar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false);
  const [listingToUnpublish, setListingToUnpublish] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
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

  const handleUnpublishClick = (listing) => {
    setListingToUnpublish(listing);
    setUnpublishDialogOpen(true);
  };

  const handleUnpublishConfirm = async () => {
    if (!listingToUnpublish) return;

    try {
      await unpublishListing(listingToUnpublish.id);
      await fetchMyListings();
      setUnpublishDialogOpen(false);
      setSnackbarMessage(`"${listingToUnpublish.title}" has been unpublished successfully!`);
      setSnackbarOpen(true);
      setListingToUnpublish(null);
    } catch (err) {
      setError(err.message || 'Failed to unpublish listing');
      setUnpublishDialogOpen(false);
    }
  };

  const handleUnpublishCancel = () => {
    setUnpublishDialogOpen(false);
    setListingToUnpublish(null);
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
                  published={listing.published}
                />
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {listing.published ? (
                    <>
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
                        onClick={() => handleUnpublishClick(listing)}
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

      {/* Unpublish Confirmation Dialog */}
      <Dialog
        open={unpublishDialogOpen}
        onClose={handleUnpublishCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <WarningAmberIcon sx={{ color: 'warning.main', fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Unpublish Listing
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to unpublish <strong>&quot;{listingToUnpublish?.title}&quot;</strong>?
          </DialogContentText>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              This will:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 0 }}>
              <li>Hide the listing from all guests</li>
              <li>Prevent new bookings from being made</li>
              <li>Keep existing bookings intact</li>
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleUnpublishCancel}
            sx={{
              color: '#717171',
              fontWeight: 500,
              textTransform: 'none',
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUnpublishConfirm}
            variant="contained"
            color="warning"
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              px: 3
            }}
          >
            Unpublish
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          icon={<CheckCircleIcon />}
          sx={{
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            fontSize: '0.938rem',
            fontWeight: 500
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
