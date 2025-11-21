import { useState } from 'react';
import {
  Box, TextField, Button, FormControl, InputLabel,
  Select, MenuItem, Paper, Typography, Collapse, IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

export default function SearchFilters({ onFilter }) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [bedroomsMin, setBedroomsMin] = useState('');
  const [bedroomsMax, setBedroomsMax] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSearch = () => {
    onFilter({
      searchText,
      bedroomsMin: bedroomsMin ? parseInt(bedroomsMin) : null,
      bedroomsMax: bedroomsMax ? parseInt(bedroomsMax) : null,
      dateStart,
      dateEnd,
      priceMin: priceMin ? parseFloat(priceMin) : null,
      priceMax: priceMax ? parseFloat(priceMax) : null,
      sortBy,
      sortOrder
    });
  };

  const handleClear = () => {
    setSearchText('');
    setBedroomsMin('');
    setBedroomsMax('');
    setDateStart('');
    setDateEnd('');
    setPriceMin('');
    setPriceMax('');
    setSortBy('');
    setSortOrder('asc');
    onFilter({
      searchText: '',
      bedroomsMin: null,
      bedroomsMax: null,
      dateStart: '',
      dateEnd: '',
      priceMin: null,
      priceMax: null,
      sortBy: '',
      sortOrder: 'asc'
    });
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          fullWidth
          placeholder="Search by title or city..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: <SearchIcon sx={{
              mr: 1, color: 'text.secondary'
            }} />
          }}
        />
        <IconButton onClick={() => setShowFilters(!showFilters)}
          color="primary">
          <FilterListIcon />
        </IconButton>
        <Button variant="contained" onClick={handleSearch} sx={{
          minWidth:
                        100
        }}>
                    Search
        </Button>
        <IconButton onClick={handleClear} color="secondary">
          <ClearIcon />
        </IconButton>
      </Box>

      <Collapse in={showFilters}>
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Filters</Typography>

          {/* Bedrooms Filter */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              label="Min Bedrooms"
              type="number"
              value={bedroomsMin}
              onChange={(e) => setBedroomsMin(e.target.value)}
              size="small"
              inputProps={{ min: 0 }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Max Bedrooms"
              type="number"
              value={bedroomsMax}
              onChange={(e) => setBedroomsMax(e.target.value)}
              size="small"
              inputProps={{ min: 0 }}
              sx={{ flex: 1 }}
            />
          </Box>

          {/* Date Range Filter */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              label="Check-in"
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Check-out"
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Box>

          {/* Price Range Filter */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              label="Min Price"
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              size="small"
              inputProps={{ min: 0 }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Max Price"
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              size="small"
              inputProps={{ min: 0 }}
              sx={{ flex: 1 }}
            />
          </Box>

          {/* Sort Options */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} onChange={(e) =>
                setSortBy(e.target.value)} label="Sort By">
                <MenuItem value="">None</MenuItem>
                <MenuItem value="bedrooms">Bedrooms</MenuItem>
                <MenuItem value="price">Price</MenuItem>
                <MenuItem value="rating">Rating</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Order</InputLabel>
              <Select value={sortOrder} onChange={(e) =>
                setSortOrder(e.target.value)} label="Order">
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}