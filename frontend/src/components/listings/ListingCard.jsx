import { Card, CardMedia, CardContent, Typography, Box, IconButton, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';

export default function ListingCard({ listing, onDelete, isHostView = false, published }) {
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
    <Card
      elevation={0}
      sx={{
        cursor: 'pointer',
        width: '100%',
        height: 420,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'white',
        borderRadius: 2.5,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        border: '1px solid transparent',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          border: '1px solid rgba(0,0,0,0.08)'
        }
      }}
      onClick={handleCardClick}
    >
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          height: 260,
          minHeight: 260,
          maxHeight: 260,
          flexShrink: 0,
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.05) 100%)',
            opacity: 0,
            transition: 'opacity 0.3s ease'
          },
          '&:hover::after': {
            opacity: 1
          }
        }}
      >
        {isYouTube ? (
          <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
            <iframe
              width="100%"
              height="100%"
              src={thumbnail}
              title={listing.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ pointerEvents: 'none', display: 'block' }}
            />
          </Box>
        ) : (
          <CardMedia
            component="img"
            image={thumbnail}
            alt={listing.title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          />
        )}
        {isHostView && (
          <>
            {/* Status Badge */}
            <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
              {published ? (
                <Chip
                  label="Live"
                  color="success"
                  size="small"
                  sx={{
                    fontWeight: 600,
                    bgcolor: 'success.main',
                    color: 'white',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                />
              ) : (
                <Chip
                  label="Unpublished"
                  size="small"
                  sx={{
                    fontWeight: 600,
                    bgcolor: 'rgba(117,117,117,0.95)',
                    color: 'white',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                />
              )}
            </Box>

            {/* Action Buttons */}
            <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 0.75 }}>
              <IconButton
                onClick={handleEdit}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'white',
                    transform: 'scale(1.1)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                onClick={handleDelete}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'white',
                    transform: 'scale(1.1)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <DeleteIcon fontSize="small" color="error" />
              </IconButton>
            </Box>
          </>
        )}
      </Box>
      <CardContent sx={{ height: 160, p: 2, '&:last-child': { pb: 2 }, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              color: '#222',
              fontSize: '1rem',
              lineHeight: 1.4,
              letterSpacing: '-0.01em'
            }}
            noWrap
          >
            {listing.title}
          </Typography>
          {avgRating && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.4,
                flexShrink: 0,
                ml: 1,
                bgcolor: 'rgba(0,0,0,0.03)',
                px: 1,
                py: 0.25,
                borderRadius: 1.5
              }}
            >
              <StarIcon sx={{ fontSize: 14, color: 'warning.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#222' }}>
                {avgRating}
              </Typography>
            </Box>
          )}
        </Box>
        <Typography
          variant="body2"
          sx={{
            color: '#717171',
            fontSize: '0.875rem',
            mb: 0.5,
            fontWeight: 500
          }}
        >
          {listing.metadata?.propertyType || 'Property'}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#717171',
            fontSize: '0.875rem',
            mb: 1.5,
            lineHeight: 1.5
          }}
        >
          {totalBeds} bed{totalBeds !== 1 ? 's' : ''} · {listing.metadata?.bathrooms || 0} bath
          {listing.metadata?.bathrooms !== 1 ? 's' : ''}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 700,
              color: '#222',
              fontSize: '1.05rem',
              letterSpacing: '-0.02em'
            }}
          >
            ${listing.price}
          </Typography>
          <Typography variant="body2" sx={{ color: '#717171', fontSize: '0.875rem', fontWeight: 400 }}>
            night
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}