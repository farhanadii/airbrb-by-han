import { Box } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarBorderIcon from '@mui/icons-material/StarBorder';

export default function StarRating({ rating, reviewCount }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(<StarIcon key={`full-${i}`} sx={{ color: '#ffd700' }} />);
  }

  // Add half star if needed
  if (hasHalfStar && fullStars < 5) {
    stars.push(<StarHalfIcon key="half" sx={{ color: '#ffd700' }} />);
  }

  // Add empty stars
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<StarBorderIcon key={`empty-${i}`} sx={{ color: '#ffd700' }}
    />);
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {stars}
      {reviewCount !== undefined && (
        <Box component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                    ({reviewCount})
        </Box>
      )}
    </Box>
  );
}
