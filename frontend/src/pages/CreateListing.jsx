import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, TextField, Button, Typography, Box, Alert,
  FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput, Tabs, Tab,
  IconButton, Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { createListing, publishListing } from '../services/api';
import BedroomInput from '../components/listings/BedroomInput';

const AMENITIES_OPTIONS = [
  'WiFi', 'Kitchen', 'Washer', 'Dryer', 'Air Conditioning',
  'Heating', 'TV', 'Pool', 'Gym', 'Parking', 'Hot Tub'
];

export default function CreateListing() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
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
    availabilityEnd: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(images => {
      const newImages = [...formData.images, ...images];
      handleChange('images', newImages);
      // Set first image as thumbnail if no thumbnail exists
      if (!formData.thumbnail && newImages.length > 0) {
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
          availabilityEnd: formData.availabilityEnd
        }
      };

      const result = await createListing(listingData);

      // Auto-publish if availability dates are set
      if (formData.availabilityStart && formData.availabilityEnd) {
        const availability = [{
          start: formData.availabilityStart,
          end: formData.availabilityEnd
        }];
        await publishListing(result.listingId, availability);
        navigate('/hosted', { state: { message: 'Listing created and published successfully!' } });
      } else {
        navigate('/hosted', { state: { message: 'Listing created successfully! Remember to publish it to make it visible to guests.' } });
      }
    } catch (err) {
      setError(err.message || 'Failed to create listing');
    }
  };

  return (
    <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 }, mt: { xs: 2, sm: 3, md: 4 }, mb: { xs: 3, sm: 4 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                Create New Listing
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
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                The first image you upload in the gallery below will be used as the thumbnail
              </Typography>
              {formData.thumbnail && !formData.youtubeUrl && (
                <Box sx={{ mt: 2, p: 2, border: '2px solid', borderColor: 'primary.main', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main', fontWeight: 600 }}>
                    Current Thumbnail
                  </Typography>
                  <img src={formData.thumbnail} alt="Thumbnail preview"
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
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
          <BedroomInput
            bedrooms={formData.bedrooms}
            onChange={(bedrooms) => handleChange('bedrooms', bedrooms)}
          />
        </Box>

        <Box sx={{ mt: { xs: 2, sm: 3 } }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Property Images
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            Click on any image to set it as the thumbnail
          </Typography>
          <Button variant="outlined" component="label" fullWidth>
            Add More Images
            <input type="file" hidden multiple accept="image/*"
              onChange={handleImageUpload} />
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

        <FormControl fullWidth margin="normal">
          <InputLabel>Amenities</InputLabel>
          <Select
            multiple
            value={formData.amenities}
            onChange={(e) => handleChange('amenities', e.target.value)}
            input={<OutlinedInput label="Amenities" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            {AMENITIES_OPTIONS.map((amenity) => (
              <MenuItem key={amenity} value={amenity}>
                {amenity}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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

        <Box sx={{ mt: { xs: 3, sm: 4 }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <Button type="submit" variant="contained" size="large" fullWidth>
            Create Listing
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