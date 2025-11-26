import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container, TextField, Button, Typography, Box, Alert,
  FormControl, Chip, IconButton,
  Grid, Tabs, Tab, Checkbox, FormGroup, FormControlLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getListing, updateListing } from '../services/api';
import BedroomInput from '../components/listings/BedroomInput';

const AMENITIES_OPTIONS = [
  'WiFi', 'Kitchen', 'Washer', 'Dryer', 'Air Conditioning',
  'Heating', 'TV', 'Pool', 'Gym', 'Parking', 'Hot Tub'
];

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [thumbnailTab, setThumbnailTab] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    price: '',
    thumbnail: '',
    youtubeUrl: '',
    propertyType: '',
    bathrooms: '',
    bedrooms: [{ beds: 1, type: 'Single' }],
    amenities: [],
    images: [],
    availabilityStart: '',
    availabilityEnd: '',
    customDiscounts: []
  });

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await getListing(id);
        const listing = data.listing;

        const isYouTube = listing.thumbnail?.includes('youtube.com');

        setFormData({
          title: listing.title || '',
          address: listing.address || '',
          price: listing.price || '',
          thumbnail: isYouTube ? '' : listing.thumbnail || '',
          youtubeUrl: isYouTube ? listing.thumbnail : '',
          propertyType: listing.metadata?.propertyType || '',
          bathrooms: listing.metadata?.bathrooms || '',
          bedrooms: listing.metadata?.bedrooms || [{
            beds: 1, type: 'Single'
          }],
          amenities: listing.metadata?.amenities || [],
          images: listing.metadata?.images || [],
          availabilityStart: listing.metadata?.availabilityStart || '',
          availabilityEnd: listing.metadata?.availabilityEnd || '',
          customDiscounts: listing.metadata?.customDiscounts || []
        });

        if (isYouTube) {
          setThumbnailTab(1);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load listing');
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addDiscountTier = () => {
    const newTier = {
      minNights: '',
      maxNights: '',
      discount: ''
    };
    let newDiscounts = [...formData.customDiscounts, newTier];

    // Auto-update max nights for all tiers except the last one
    newDiscounts = newDiscounts.map((tier, i) => {
      if (i < newDiscounts.length - 1) {
        const nextMin = parseInt(newDiscounts[i + 1].minNights);
        if (nextMin && nextMin > 0) {
          return { ...tier, maxNights: (nextMin - 1).toString() };
        }
      } else {
        return { ...tier, maxNights: '' };
      }
      return tier;
    });

    handleChange('customDiscounts', newDiscounts);
  };

  const removeDiscountTier = (index) => {
    let newDiscounts = formData.customDiscounts.filter((_, i) => i !== index);

    // Auto-update max nights for all tiers except the last one
    newDiscounts = newDiscounts.map((tier, i) => {
      if (i < newDiscounts.length - 1) {
        const nextMin = parseInt(newDiscounts[i + 1].minNights);
        if (nextMin && nextMin > 0) {
          return { ...tier, maxNights: (nextMin - 1).toString() };
        }
      } else {
        return { ...tier, maxNights: '' };
      }
      return tier;
    });

    handleChange('customDiscounts', newDiscounts);
  };

  const updateDiscountTier = (index, field, value) => {
    let newDiscounts = formData.customDiscounts.map((tier, i) =>
      i === index ? { ...tier, [field]: value } : tier
    );

    // Auto-update max nights for all tiers except the last one
    // Each tier's max = next tier's min - 1 (if next tier exists)
    newDiscounts = newDiscounts.map((tier, i) => {
      if (i < newDiscounts.length - 1) {
        // Not the last tier - set max to next tier's min - 1
        const nextMin = parseInt(newDiscounts[i + 1].minNights);
        if (nextMin && nextMin > 0) {
          return { ...tier, maxNights: (nextMin - 1).toString() };
        }
      } else {
        // Last tier - always no max limit
        return { ...tier, maxNights: '' };
      }
      return tier;
    });

    handleChange('customDiscounts', newDiscounts);
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        // Add to images array if not already there
        if (!formData.images.includes(imageData)) {
          handleChange('images', [imageData, ...formData.images]);
        }
        // Set as thumbnail
        handleChange('thumbnail', imageData);
        handleChange('youtubeUrl', '');
      };
      reader.readAsDataURL(file);
    }
  };

  const extractYouTubeEmbedUrl = (url) => {
    // Handle various YouTube URL formats:
    // - https://www.youtube.com/watch?v=VIDEO_ID
    // - https://youtu.be/VIDEO_ID
    // - https://www.youtube.com/embed/VIDEO_ID
    // - https://www.youtube.com/v/VIDEO_ID
    const videoIdMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    return url;
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 10 - formData.images.length;
    const filesToUpload = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more image(s). Maximum is 10 images.`);
    }

    const readers = filesToUpload.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(images => {
      const newImages = [...formData.images, ...images];
      handleChange('images', newImages);
      // Set first image as thumbnail if no thumbnail exists or thumbnail is YouTube
      if ((!formData.thumbnail || formData.thumbnail.includes('youtube')) && newImages.length > 0) {
        handleChange('thumbnail', newImages[0]);
      }
    });
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    handleChange('images', newImages);
    // If removed image was the thumbnail, set first remaining image as thumbnail
    if (formData.thumbnail === formData.images[index]) {
      handleChange('thumbnail', newImages.length > 0 ? newImages[0] : '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.address || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.bedrooms.length === 0) {
      setError('Please add at least one bedroom');
      return;
    }

    try {
      let thumbnailValue = formData.thumbnail ||
                'https://via.placeholder.com/300x200?text=No+Image';

      if (thumbnailTab === 1 && formData.youtubeUrl) {
        thumbnailValue = extractYouTubeEmbedUrl(formData.youtubeUrl);
      }

      const listingData = {
        title: formData.title,
        address: formData.address,
        price: parseFloat(formData.price),
        thumbnail: thumbnailValue,
        metadata: {
          propertyType: formData.propertyType,
          bathrooms: parseInt(formData.bathrooms) || 0,
          bedrooms: formData.bedrooms,
          amenities: formData.amenities,
          images: formData.images,
          availabilityStart: formData.availabilityStart,
          availabilityEnd: formData.availabilityEnd,
          discountsEnabled: formData.customDiscounts.length > 0 && formData.customDiscounts.some(tier =>
            tier.minNights && parseInt(tier.minNights) > 0 && tier.discount && parseFloat(tier.discount) > 0
          ),
          customDiscounts: formData.customDiscounts
            .filter(tier => tier.minNights && parseInt(tier.minNights) > 0 && tier.discount && parseFloat(tier.discount) > 0)
            .map(tier => ({
              minNights: parseInt(tier.minNights),
              maxNights: tier.maxNights ? parseInt(tier.maxNights) : null,
              discount: parseFloat(tier.discount)
            }))
        }
      };

      await updateListing(id, listingData);
      navigate('/hosted');
    } catch (err) {
      setError(err.message || 'Failed to update listing');
    }
  };

  if (loading) {
    return <Container sx={{
      px: { xs: 2, sm: 3 }, mt: { xs: 2, sm: 3, md: 4 }
    }}><Typography>Loading...</Typography></Container>;
  }

  return (
    <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 }, mt: { xs: 2, sm: 3, md: 4 }, mb: { xs: 3, sm: 4 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                Edit Listing
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: { xs: 2, sm: 3 } }}>
        <TextField
          fullWidth
          required
          label="Listing Title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          margin="normal"
        />

        <TextField
          fullWidth
          required
          label="Address"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          margin="normal"
          placeholder="e.g. 123 Main St, Sydney, NSW 2000"
        />

        <TextField
          fullWidth
          required
          label="Price per Night"
          type="number"
          value={formData.price}
          onChange={(e) => handleChange('price', e.target.value)}
          margin="normal"
          inputProps={{ min: 0, step: 0.01 }}
        />

        <Box sx={{ mt: { xs: 2, sm: 3 }, mb: 2 }}>
          <Tabs value={thumbnailTab} onChange={(e, v) => setThumbnailTab(v)}>
            <Tab label="Image Upload" />
            <Tab label="YouTube Video" />
          </Tabs>

          {thumbnailTab === 0 ? (
            <>
              <Button variant="outlined" component="label" fullWidth sx={{
                mt: 2, py: 1.5
              }}>
                                Update Thumbnail Image
                <input type="file" hidden accept="image/*"
                  onChange={handleThumbnailUpload} />
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                This image will be used as the main thumbnail and automatically added to the gallery
              </Typography>
              {formData.thumbnail && !formData.youtubeUrl && (
                <Box sx={{ mt: 2, p: 2, border: '2px solid', borderColor: 'primary.main', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main', fontWeight: 600 }}>
                    Current Thumbnail
                  </Typography>
                  <img src={formData.thumbnail} alt="Thumbnail" style={{
                    maxWidth: '100%', maxHeight: '200px', borderRadius: '8px'
                  }} />
                </Box>
              )}
            </>
          ) : (
            <>
              <TextField
                fullWidth
                label="YouTube Video URL"
                value={formData.youtubeUrl}
                onChange={(e) => {
                  handleChange('youtubeUrl', e.target.value);
                  handleChange('thumbnail', '');
                }}
                placeholder="e.g. https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID"
                sx={{ mt: 2 }}
                helperText="Paste any YouTube video URL - we'll convert it automatically"
              />
              {formData.youtubeUrl && (
                <Box sx={{ mt: 2 }}>
                  <iframe
                    width="100%"
                    height="200"
                    src={extractYouTubeEmbedUrl(formData.youtubeUrl)}
                    title="YouTube preview"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write;
  encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </Box>
              )}
            </>
          )}
        </Box>

        <TextField
          fullWidth
          label="Property Type"
          value={formData.propertyType}
          onChange={(e) => handleChange('propertyType', e.target.value)}
          margin="normal"
          placeholder="e.g. House, Apartment, Villa"
        />

        <TextField
          fullWidth
          label="Number of Bathrooms"
          type="number"
          value={formData.bathrooms}
          onChange={(e) => handleChange('bathrooms', e.target.value)}
          margin="normal"
          inputProps={{ min: 0 }}
        />

        <Box sx={{ mt: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
          <BedroomInput bedrooms={formData.bedrooms} onChange={(bedrooms) =>
            handleChange('bedrooms', bedrooms)} />
        </Box>

        <FormControl fullWidth margin="normal">
          <Typography variant="subtitle1" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Amenities
          </Typography>
          <Box sx={{
            border: '1px solid rgba(0,0,0,0.23)',
            borderRadius: 2,
            p: 2,
            mb: 1
          }}>
            <FormGroup>
              <Grid container spacing={1}>
                {AMENITIES_OPTIONS.map((amenity) => (
                  <Grid item xs={6} sm={4} key={amenity}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.amenities.includes(amenity)}
                          onChange={(e) => {
                            const newAmenities = e.target.checked
                              ? [...formData.amenities, amenity]
                              : formData.amenities.filter(a => a !== amenity);
                            handleChange('amenities', newAmenities);
                          }}
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">{amenity}</Typography>}
                    />
                  </Grid>
                ))}
              </Grid>
            </FormGroup>
          </Box>
          {formData.amenities.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {formData.amenities.map((value) => (
                <Chip
                  key={value}
                  label={value}
                  size="small"
                  onDelete={() => handleChange('amenities', formData.amenities.filter(a => a !== value))}
                />
              ))}
            </Box>
          )}
        </FormControl>

        <Box sx={{ mt: { xs: 2, sm: 3 } }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Property Images
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            Upload up to 10 photos to better showcase your property
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            Click on any image to set it as the thumbnail
          </Typography>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            disabled={formData.images.length >= 10}
          >
            {formData.images.length >= 10 ? 'Maximum images reached (10/10)' : `Add Images (${formData.images.length}/10)`}
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={formData.images.length >= 10}
            />
          </Button>

          <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mt: 1 }}>
            {formData.images.map((image, index) => (
              <Grid item xs={6} sm={4} key={index}>
                <Box
                  sx={{
                    position: 'relative',
                    cursor: 'pointer',
                    border: formData.thumbnail === image ? '3px solid' : '2px solid transparent', borderColor: formData.thumbnail === image ? 'primary.main' : 'transparent',
                    borderRadius: 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      border: '3px solid',
                      borderColor: 'primary.main',
                      transform: 'scale(1.02)'
                    }
                  }}
                  onClick={() => handleChange('thumbnail', image)}
                >
                  <img src={image} alt={`Property ${index + 1}`} style={{
                    width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px'
                  }} />
                  {formData.thumbnail === image && (
                    <Box sx={{
                      position: 'absolute',
                      top: 5,
                      left: 5,
                      bgcolor: 'primary.main',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      THUMBNAIL
                    </Box>
                  )}
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    sx={{
                      position: 'absolute', top: 5, right: 5, bgcolor: 'white'
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Availability
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set when your property is available for bookings
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              fullWidth
              label="Available From"
              type="date"
              value={formData.availabilityStart}
              onChange={(e) => handleChange('availabilityStart', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Available Until"
              type="date"
              value={formData.availabilityEnd}
              onChange={(e) => handleChange('availabilityEnd', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Multi-Night Discounts (Optional)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create custom discount tiers for longer stays to attract more bookings
          </Typography>

          <Box sx={{ mt: 2 }}>
            {formData.customDiscounts.map((tier, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  gap: 2,
                  mb: 2,
                  p: 2,
                  border: '1px solid #E5E7EB',
                  borderRadius: 2,
                  bgcolor: '#F9FAFB',
                  alignItems: 'flex-start'
                }}
              >
                <TextField
                  label="Min Nights"
                  type="number"
                  value={tier.minNights}
                  onChange={(e) => updateDiscountTier(index, 'minNights', e.target.value)}
                  sx={{ flex: 1 }}
                  size="small"
                  inputProps={{ min: 1 }}
                />
                <TextField
                  label="Max Nights"
                  type="number"
                  value={tier.maxNights}
                  onChange={(e) => updateDiscountTier(index, 'maxNights', e.target.value)}
                  sx={{ flex: 1 }}
                  size="small"
                  disabled={index < formData.customDiscounts.length - 1}
                  helperText={index < formData.customDiscounts.length - 1 ? "Auto-set to next tier's min - 1" : "Leave empty for no limit"}
                  inputProps={{ min: 1 }}
                />
                <TextField
                  label="Discount (%)"
                  type="number"
                  value={tier.discount}
                  onChange={(e) => updateDiscountTier(index, 'discount', e.target.value)}
                  sx={{ flex: 1 }}
                  size="small"
                  inputProps={{ min: 0, max: 100, step: 1 }}
                />
                <IconButton
                  color="error"
                  onClick={() => removeDiscountTier(index)}
                  sx={{ mt: 0.5 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addDiscountTier}
              fullWidth
            >
              Add Discount Tier
            </Button>
          </Box>
        </Box>

        <Box sx={{ mt: { xs: 3, sm: 4 }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <Button type="submit" variant="contained" size="large" fullWidth>
            Save Changes
          </Button>
          <Button variant="outlined" size="large" onClick={() =>
            navigate('/hosted')} fullWidth>
            Cancel
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
