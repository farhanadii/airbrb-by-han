import { useState, useEffect } from 'react';
import { Container, Typography, Box, Tabs, Tab, Paper, Grid, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getAllListings, getAllBookings, getListing } from '../services/api';
import ListingCard from '../components/listings/ListingCard';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import HistoryIcon from '@mui/icons-material/History';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ marginTop: '24px' }}>
      {value === index && children}
    </div>
  );
}

export default function Profile() {
  const { userEmail } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [myListings, setMyListings] = useState([]);
  const [bookingsWithDetails, setBookingsWithDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const listingsData = await getAllListings();
        const userListings = listingsData.listings.filter(l => l.owner === userEmail);

        const detailedListings = await Promise.all(
          userListings.map(async (listing) => {
            try {
              const details = await getListing(listing.id);
              return { ...listing, ...details.listing };
            } catch {
              return listing;
            }
          })
        );

        setMyListings(detailedListings);

        const bookingsData = await getAllBookings();
        const userBookings = bookingsData.bookings.filter(b => b.owner === userEmail);

        const bookingsWithListingDetails = await Promise.all(
          userBookings.map(async (booking) => {
            try {
              const listingData = await getListing(booking.listingId);
              return { ...booking, listing: listingData.listing };
            } catch {
              return booking;
            }
          })
        );
        setBookingsWithDetails(bookingsWithListingDetails);

        setError('');
      } catch (err) {
        setError(err.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userEmail]);

  const activeBookings = bookingsWithDetails.filter(b =>
    b.status === 'accepted' && new Date(b.dateRange.end) >= new Date()
  );

  const pastBookings = bookingsWithDetails.filter(b =>
    b.status === 'accepted' && new Date(b.dateRange.end) < new Date()
  );

  const publishedListings = myListings.filter(l => l.published);
  const unpublishedListings = myListings.filter(l => !l.published);

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Loading your profile...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: 4, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            My Profile
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {userEmail}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              minHeight: 64
            }
          }}
        >
          <Tab icon={<HomeIcon />} iconPosition="start" label={`My Listings (${myListings.length})`} />
          <Tab icon={<BookmarksIcon />} iconPosition="start" label={`Active Bookings (${activeBookings.length})`} />
          <Tab icon={<HistoryIcon />} iconPosition="start" label={`History (${pastBookings.length})`} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={currentTab} index={0}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Published Listings ({publishedListings.length})
              </Typography>
              {publishedListings.length > 0 ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                      lg: 'repeat(4, 1fr)'
                    },
                    gap: 3,
                    width: '100%'
                  }}
                >
                  {publishedListings.map(listing => (
                    <Box key={listing.id} sx={{ minWidth: 0 }}>
                      <ListingCard listing={listing} isHostView={false} />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">No published listings yet.</Typography>
              )}
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Unpublished Listings ({unpublishedListings.length})
              </Typography>
              {unpublishedListings.length > 0 ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                      lg: 'repeat(4, 1fr)'
                    },
                    gap: 3,
                    width: '100%'
                  }}
                >
                  {unpublishedListings.map(listing => (
                    <Box key={listing.id} sx={{ minWidth: 0 }}>
                      <ListingCard listing={listing} isHostView={false} />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">No unpublished listings.</Typography>
              )}
            </Box>
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Your Upcoming & Current Stays
            </Typography>
            {activeBookings.length > 0 ? (
              <Grid container spacing={3}>
                {activeBookings.map(booking => (
                  <Grid item xs={12} key={booking.id}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                      <Typography variant="h6">
                        {booking.listing?.title || 'Listing'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(booking.dateRange.start).toLocaleDateString()} -
                        {new Date(booking.dateRange.end).toLocaleDateString()}
                      </Typography>
                      {booking.totalPrice && (
                        <Typography variant="h6" sx={{ mt: 2, color: 'success.main' }}>
                          Total: ${booking.totalPrice.toFixed(2)}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">
                You don&apos;t have any active bookings.
              </Alert>
            )}
          </TabPanel>

          <TabPanel value={currentTab} index={2}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Past Bookings
            </Typography>
            {pastBookings.length > 0 ? (
              <Grid container spacing={3}>
                {pastBookings.map(booking => (
                  <Grid item xs={12} key={booking.id}>
                    <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#F9FAFB' }}>
                      <Typography variant="h6" sx={{ color: '#6B7280' }}>
                        {booking.listing?.title || 'Listing'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(booking.dateRange.start).toLocaleDateString()} -
                        {new Date(booking.dateRange.end).toLocaleDateString()}
                      </Typography>
                      {booking.totalPrice && (
                        <Typography variant="body1" sx={{ mt: 2, color: '#6B7280', fontWeight: 500 }}>
                          Total: ${booking.totalPrice.toFixed(2)}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">
                No past bookings found.
              </Alert>
            )}
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
}
