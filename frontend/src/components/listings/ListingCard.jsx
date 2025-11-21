import { Card, CardMedia, CardContent, Typography, Box, IconButton } from
    '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import RatingBreakdown from '../common/RatingBreakdown';

export default function ListingCard({ listing, onDelete, isHostView = false
}) {
    const navigate = useNavigate();

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
    const totalBeds = listing.metadata?.bedrooms?.reduce((sum, room) => sum +
        (room.beds || 0), 0) || 0;

    const isYouTube = thumbnail.includes('youtube.com');

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
            {isYouTube ? (
                <Box sx={{ height: 200, position: 'relative' }}>
                    <iframe
                        width="100%"
                        height="100%"
                        src={thumbnail}
                        title={listing.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media;
   gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ pointerEvents: 'none' }}
                    />
                </Box>
            ) : (
                <CardMedia
                    component="img"
                    height="200"
                    image={thumbnail}
                    alt={listing.title}
                    sx={{ objectFit: 'cover' }}
                />
            )}
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

                <Box sx={{ mt: 1 }} onClick={(e) => e.stopPropagation()}>
                    <RatingBreakdown reviews={listing.reviews || []} />
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