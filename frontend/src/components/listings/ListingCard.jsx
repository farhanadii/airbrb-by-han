import { Card, CardMedia, CardContent, Typography, Box, IconButton } from
    '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import StarRating from '../common/StarRating';

export default function ListingCard({ listing, onDelete, isHostView = false
}) {
    const navigate = useNavigate();

    const calculateAverageRating = () => {
        if (!listing.reviews || listing.reviews.length === 0) return 0;
        const sum = listing.reviews.reduce((acc, review) => acc + review.rating,
            0);
        return sum / listing.reviews.length;
    };

    const handleCardClick = () => {
        if (isHostView) {
            navigate(`/listings/${listing.id}/edit`);
        } else {
            navigate(`/listings/${listing.id}`);
        }
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        navigate(`/listings/${listing.id}/edit`);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(listing.id);
    };

    const thumbnail = listing.thumbnail ||
        'https://via.placeholder.com/300x200?text=No+Image';
    const avgRating = calculateAverageRating();
    const reviewCount = listing.reviews?.length || 0;
    const totalBeds = listing.metadata?.bedrooms?.reduce((sum, room) => sum +
        (room.beds || 0), 0) || 0;

    return (
        <Card
            sx={{
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': { boxShadow: 6 }
            }}
            onClick={handleCardClick}
        >
            <CardMedia
                component="img"
                height="200"
                image={thumbnail}
                alt={listing.title}
                sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom noWrap>
                    {listing.title}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                    {listing.metadata?.propertyType || 'Property'}
                </Typography>

                <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                        {totalBeds} bed{totalBeds !== 1 ? 's' : ''} •
                        {listing.metadata?.bathrooms || 0} bath{listing.metadata?.bathrooms !== 1 ?
                            's' : ''}
                    </Typography>
                </Box>

                <Box sx={{ mt: 1 }}>
                    <StarRating rating={avgRating} reviewCount={reviewCount} />
                </Box>

                <Typography variant="h6" sx={{ mt: 1 }}>
                    ${listing.price} / night
                </Typography>

                {isHostView && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <IconButton onClick={handleEdit} color="primary" size="small">
                            <EditIcon />
                        </IconButton>
                        <IconButton onClick={handleDelete} color="error" size="small">
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}