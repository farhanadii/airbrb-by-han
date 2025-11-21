import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, TextField, Button, Typography, Box, Alert,
    FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput, Tabs, Tab
} from '@mui/material';
import { createListing } from '../services/api';
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
        amenities: []
    });

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleThumbnailUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleChange('thumbnail', reader.result);
                handleChange('youtubeUrl', '');
            };
            reader.readAsDataURL(file);
        }
    };

    const extractYouTubeEmbedUrl = (url) => {
        const videoIdMatch =
            url.match(/(?:embed\/|v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
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
                    amenities: formData.amenities
                }
            };

            await createListing(listingData);
            navigate('/hosted');
        } catch (err) {
            setError(err.message || 'Failed to create listing');
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Create New Listing
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
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

                <Box sx={{ mt: 3, mb: 2 }}>
                    <Tabs value={thumbnailTab} onChange={(e, v) => setThumbnailTab(v)}>
                        <Tab label="Image Upload" />
                        <Tab label="YouTube Video" />
                    </Tabs>

                    {thumbnailTab === 0 ? (
                        <>
                            <Button variant="outlined" component="label" fullWidth sx={{
                                mt: 2
                            }}>
                                Upload Thumbnail Image
                                <input type="file" hidden accept="image/*"
                                    onChange={handleThumbnailUpload} />
                            </Button>
                            {formData.thumbnail && !formData.youtubeUrl && (
                                <Box sx={{ mt: 2 }}>
                                    <img src={formData.thumbnail} alt="Thumbnail preview"
                                        style={{ maxWidth: '200px', maxHeight: '150px' }} />
                                </Box>
                            )}
                        </>
                    ) : (
                        <>
                            <TextField
                                fullWidth
                                label="YouTube Embed URL"
                                value={formData.youtubeUrl}
                                onChange={(e) => {
                                    handleChange('youtubeUrl', e.target.value);
                                    handleChange('thumbnail', '');
                                }}
                                placeholder="e.g. https://www.youtube.com/embed/VIDEO_ID"
                                sx={{ mt: 2 }}
                                helperText="Paste a YouTube embed URL"
                            />
                            {formData.youtubeUrl && (
                                <Box sx={{ mt: 2 }}>
                                    <iframe
                                        width="300"
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

                <Box sx={{ mt: 3, mb: 3 }}>
                    <BedroomInput
                        bedrooms={formData.bedrooms}
                        onChange={(bedrooms) => handleChange('bedrooms', bedrooms)}
                    />
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

                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
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