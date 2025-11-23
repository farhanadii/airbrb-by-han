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
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        mb: { xs: 2, sm: 3 },
        borderRadius: 2.5,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease'
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 2 }, alignItems: { xs: 'stretch', sm: 'center' } }}>
        <TextField
          fullWidth
          placeholder="Search by title or city..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          size="small"
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              },
              '&.Mui-focused': {
                boxShadow: '0 2px 12px rgba(255,56,92,0.15)'
              }
            }
          }}
        />
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: { xs: 'stretch', sm: 'flex-start' } }}>
          <IconButton
            onClick={() => setShowFilters(!showFilters)}
            sx={{
              color: showFilters ? 'primary.main' : '#717171',
              bgcolor: showFilters ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: showFilters ? 'rgba(99, 102, 241, 0.12)' : 'rgba(0,0,0,0.04)',
                transform: 'scale(1.05)'
              }
            }}
            size="small"
          >
            <FilterListIcon />
          </IconButton>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            sx={{
              minWidth: { xs: 'auto', sm: 110 },
              flex: { xs: 1, sm: 'initial' },
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
                transform: 'translateY(-1px)'
              }
            }}
            size="small"
          >
            Search
          </Button>
          <IconButton
            onClick={handleClear}
            sx={{
              color: '#717171',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.04)',
                transform: 'rotate(90deg) scale(1.05)'
              }
            }}
            size="small"
          >
            <ClearIcon />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={showFilters}>
        <Box sx={{ mt: { xs: 2.5, sm: 3 } }}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#222',
              mb: 2.5,
              letterSpacing: '-0.01em'
            }}
          >
            Filters
          </Typography>

          {/* Bedrooms Filter */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 2 }, mt: 2 }}>
            <TextField
              label="Min Bedrooms"
              type="number"
              value={bedroomsMin}
              onChange={(e) => setBedroomsMin(e.target.value)}
              size="small"
              inputProps={{ min: 0 }}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&.Mui-focused': {
                    boxShadow: '0 2px 8px rgba(255,56,92,0.12)'
                  }
                }
              }}
            />
            <TextField
              label="Max Bedrooms"
              type="number"
              value={bedroomsMax}
              onChange={(e) => setBedroomsMax(e.target.value)}
              size="small"
              inputProps={{ min: 0 }}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&.Mui-focused': {
                    boxShadow: '0 2px 8px rgba(255,56,92,0.12)'
                  }
                }
              }}
            />
          </Box>

          {/* Date Range Filter */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 2 }, mt: 2 }}>
            <TextField
              label="Check-in"
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&.Mui-focused': {
                    boxShadow: '0 2px 8px rgba(255,56,92,0.12)'
                  }
                }
              }}
            />
            <TextField
              label="Check-out"
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&.Mui-focused': {
                    boxShadow: '0 2px 8px rgba(255,56,92,0.12)'
                  }
                }
              }}
            />
          </Box>

          {/* Price Range Filter */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 2 }, mt: 2 }}>
            <TextField
              label="Min Price"
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              size="small"
              inputProps={{ min: 0 }}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&.Mui-focused': {
                    boxShadow: '0 2px 8px rgba(255,56,92,0.12)'
                  }
                }
              }}
            />
            <TextField
              label="Max Price"
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              size="small"
              inputProps={{ min: 0 }}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&.Mui-focused': {
                    boxShadow: '0 2px 8px rgba(255,56,92,0.12)'
                  }
                }
              }}
            />
          </Box>

          {/* Sort Options */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 2 }, mt: 2 }}>
            <FormControl
              size="small"
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&.Mui-focused': {
                    boxShadow: '0 2px 8px rgba(255,56,92,0.12)'
                  }
                }
              }}
            >
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} label="Sort By">
                <MenuItem value="">None</MenuItem>
                <MenuItem value="bedrooms">Bedrooms</MenuItem>
                <MenuItem value="price">Price</MenuItem>
                <MenuItem value="rating">Rating</MenuItem>
              </Select>
            </FormControl>
            <FormControl
              size="small"
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&.Mui-focused': {
                    boxShadow: '0 2px 8px rgba(255,56,92,0.12)'
                  }
                }
              }}
            >
              <InputLabel>Order</InputLabel>
              <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} label="Order">
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