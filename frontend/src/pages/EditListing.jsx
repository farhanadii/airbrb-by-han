import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Container, TextField, Button, Typography, Box, Alert,
    FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput,
    IconButton, Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
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
    const [formData, setFormData] = useState({
        title: '',
        address: '',
        price: '',
        thumbnail: '',
        propertyType: '',
        bathrooms: '',
        bedrooms: [{ beds: 1, type: 'Single' }],
        amenities: [],
        images: []
    });

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const data = await getListing(id);
                const listing = data.listing;
                setFormData({
                    title: listing.title || '',
                    address: listing.address || '',
                    price: listing.price || '',
                    thumbnail: listing.thumbnail || '',
                    propertyType: listing.metadata?.propertyType || '',
                    bathrooms: listing.metadata?.bathrooms || '',
                    bedrooms: listing.metadata?.bedrooms || [{
                        beds: 1, type: 'Single'
                    }],
                    amenities: listing.metadata?.amenities || [],
                    images: listing.metadata?.images || []
                });
                setLoading(false);
            } catch (err) {
                setError(err.message || 'Failed to load listing');
                setLoading(false);
            }
        };
        fetchListing();
    }, [id]);

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleThumbnailUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleChange('thumbnail', reader.result);
            };
            reader.readAsDataURL(file);
        }
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
            handleChange('images', [...formData.images, ...images]);
        });
    };

    const removeImage = (index) => {
        handleChange('images', formData.images.filter((_, i) => i !== index));
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
            const listingData = {
                title: formData.title,
                address: formData.address,
                price: parseFloat(formData.price),
                thumbnail: formData.thumbnail ||
                    'https://via.placeholder.com/300x200?text=No+Image',
                metadata: {
                    propertyType: formData.propertyType,
                    bathrooms: parseInt(formData.bathrooms) || 0,
                    bedrooms: formData.bedrooms,
                    amenities: formData.amenities,
                    images: formData.images
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
            mt: 4
        }}><Typography>Loading...</Typography></Container>;
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Edit Listing
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

                <Button variant="outlined" component="label" fullWidth sx={{
                    mt: 2,
                    mb: 2
                }}>
                    Update Thumbnail Image
                    <input type="file" hidden accept="image/*"
                        onChange={handleThumbnailUpload} />
                </Button>
                {formData.thumbnail && (
                    <Box sx={{ mb: 2 }}>
                        <img src={formData.thumbnail} alt="Thumbnail" style={{
                            maxWidth:
                                '200px', maxHeight: '150px'
                        }} />
                    </Box>
                )}

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
                            <MenuItem key={amenity} value={amenity}>{amenity}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>Property
                        Images</Typography>
                    <Button variant="outlined" component="label" fullWidth>
                        Add More Images
                        <input type="file" hidden multiple accept="image/*"
                            onChange={handleImageUpload} />
                    </Button>

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {formData.images.map((image, index) => (
                            <Grid item xs={6} sm={4} key={index}>
                                <Box sx={{ position: 'relative' }}>
                                    <img src={image} alt={`Property ${index + 1}`} style={{
                                        width: '100%', height: '150px', objectFit: 'cover'
                                    }} />
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => removeImage(index)}
                                        sx={{
                                            position: 'absolute', top: 5, right: 5, bgcolor:
                                                'white'
                                        }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
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
