import { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Alert } from '@mui/material';
import { getAllListings, getAllBookings } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ListingCard from '../components/listings/ListingCard';
import SearchFilters from '../components/listings/SearchFilters';

export default function AllListings() {
  const [allListings, setAllListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const data = await getAllListings();

        let publishedListings = data.listings.filter(listing =>
          listing.published);

        if (isAuthenticated()) {
          const bookingsData = await getAllBookings();
          const userBookings = bookingsData.bookings;

          const bookedListingIds = userBookings
            .filter(b => b.status === 'accepted' || b.status === 'pending')
            .map(b => b.listingId);

          publishedListings.sort((a, b) => {
            const aBooked = bookedListingIds.includes(a.id);
            const bBooked = bookedListingIds.includes(b.id);

            if (aBooked && !bBooked) return -1;
            if (!aBooked && bBooked) return 1;
            return a.title.localeCompare(b.title);
          });
        } else {
          publishedListings.sort((a, b) => a.title.localeCompare(b.title));
        }

        setAllListings(publishedListings);
        setFilteredListings(publishedListings);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to load listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [isAuthenticated]);

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const getTotalBeds = (bedrooms) => {
    if (!bedrooms) return 0;
    return bedrooms.reduce((sum, room) => sum + (room.beds || 0), 0);
  };

  const checkDateAvailability = (listing, startDate, endDate) => {
    if (!listing.availability || !startDate || !endDate) return true;

    const start = new Date(startDate);
    const end = new Date(endDate);

    for (const range of listing.availability) {
      const rangeStart = new Date(range.start);
      const rangeEnd = new Date(range.end);

      if (start >= rangeStart && end <= rangeEnd) {
        return true;
      }
    }
    return false;
  };

  const handleFilter = (filters) => {
    let results = [...allListings];

    let filtersApplied = 0;

    // Text search (title or address)
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      results = results.filter(listing => {
        const titleMatch = listing.title.toLowerCase().includes(searchLower);
        const addressMatch =
                    listing.address?.toLowerCase().includes(searchLower);
        return titleMatch || addressMatch;
      });
      filtersApplied++;
    }

    // Bedrooms filter
    if (filters.bedroomsMin !== null || filters.bedroomsMax !== null) {
      results = results.filter(listing => {
        const totalBedrooms = listing.metadata?.bedrooms?.length || 0;
        const min = filters.bedroomsMin !== null ? filters.bedroomsMin : 0;
        const max = filters.bedroomsMax !== null ? filters.bedroomsMax :
          Infinity;
        return totalBedrooms >= min && totalBedrooms <= max;
      });
      filtersApplied++;
    }

    // Date range filter
    if (filters.dateStart && filters.dateEnd) {
      results = results.filter(listing =>
        checkDateAvailability(listing, filters.dateStart, filters.dateEnd)
      );
      filtersApplied++;
    }

    // Price filter
    if (filters.priceMin !== null || filters.priceMax !== null) {
      results = results.filter(listing => {
        const price = listing.price;
        const min = filters.priceMin !== null ? filters.priceMin : 0;
        const max = filters.priceMax !== null ? filters.priceMax : Infinity;
        return price >= min && price <= max;
      });
      filtersApplied++;
    }

    // Sorting - if multiple filters applied, only alphabetical sorting
    if (filtersApplied > 1) {
      results.sort((a, b) => a.title.localeCompare(b.title));
    } else if (filters.sortBy) {
      results.sort((a, b) => {
        let aValue, bValue;

        if (filters.sortBy === 'bedrooms') {
          aValue = getTotalBeds(a.metadata?.bedrooms);
          bValue = getTotalBeds(b.metadata?.bedrooms);
        } else if (filters.sortBy === 'price') {
          aValue = a.price;
          bValue = b.price;
        } else if (filters.sortBy === 'rating') {
          aValue = calculateAverageRating(a.reviews);
          bValue = calculateAverageRating(b.reviews);
        }

        return filters.sortOrder === 'asc' ? aValue - bValue : bValue -
                    aValue;
      });
    }

    setFilteredListings(results);
  };

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

      <SearchFilters onFilter={handleFilter} />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Typography>Loading...</Typography>
      ) : filteredListings.length === 0 ? (
        <Typography>No listings found matching your criteria.</Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredListings.map((listing) => (
            <Grid item xs={12} sm={6} md={4} key={listing.id}>
              <ListingCard listing={listing} isHostView={false} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}