import { Card, CardMedia, CardContent, Typography, Box, IconButton, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';

export default function ListingCard({ listing, onDelete, isHostView = false }) {
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

    const thumbnail = listing.thumbnail || 'https://via.placeholder.com/400x300?text=No+Image';
    const totalBeds = listing.metadata?.bedrooms?.reduce((sum, room) => sum + (room.beds || 0), 0) || 0;
    const isYouTube = thumbnail.includes('youtube.com');

    const avgRating = listing.reviews && listing.reviews.length > 0
        ? (listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length).toFixed(2)
        : null;

    return (
        <Card elevation={0} sx={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'transparent', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }} onClick={handleCardClick}>
            <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', mb: 1 }}>
                {isYouTube ? (
                    <Box sx={{ height: 280, position: 'relative' }}>
                        <iframe width="100%" height="100%" src={thumbnail} title={listing.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ pointerEvents: 'none' }} />
                    </Box>
                ) : (
                    <CardMedia component="img" height="280" image={thumbnail} alt={listing.title} sx={{ objectFit: 'cover' }} />
                )}
                {isHostView && (
                    <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 0.5 }}>
                        <IconButton onClick={handleEdit} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' } }}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton onClick={handleDelete} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' } }}>
                            <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                    </Box>
                )}
            </Box>
            <CardContent sx={{ flexGrow: 1, p: 0, '&:last-child': { pb: 0 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#222', fontSize: '0.95rem', lineHeight: 1.3 }} noWrap>
                        {listing.title}
                    </Typography>
                    {avgRating && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, flexShrink: 0, ml: 1 }}>
                            <StarIcon sx={{ fontSize: 14, color: '#222' }} />
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem', color: '#222' }}>
                                {avgRating}
                            </Typography>
                        </Box>
                    )}
                </Box>
                <Typography variant="body2" sx={{ color: '#717171', fontSize: '0.875rem', mb: 0.25 }}>
                    {listing.metadata?.propertyType || 'Property'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#717171', fontSize: '0.875rem', mb: 1 }}>
                    {totalBeds} bed{totalBeds !== 1 ? 's' : ''} · {listing.metadata?.bathrooms || 0} bath{listing.metadata?.bathrooms !== 1 ? 's' : ''}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#222', fontSize: '0.95rem' }}>
                        ${listing.price}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#717171', fontSize: '0.875rem' }}>
                        night
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}