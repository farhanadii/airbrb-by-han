import { useState } from 'react';
import {
    Box, Tooltip, Dialog, DialogTitle, DialogContent, Typography,
    IconButton
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';
import StarRating from './StarRating';

export default function RatingBreakdown({ reviews }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRating, setSelectedRating] = useState(null);

    const calculateBreakdown = () => {
        const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        reviews.forEach(review => {
            const rating = Math.round(review.rating);
            if (rating >= 1 && rating <= 5) {
                breakdown[rating]++;
            }
        });

        return breakdown;
    };

    const calculateAverage = () => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return sum / reviews.length;
    };

    const handleStarClick = (rating) => {
        setSelectedRating(rating);
        setModalOpen(true);
    };

    if (reviews.length === 0) {
        return <StarRating rating={0} reviewCount={0} />;
    }

    const breakdown = calculateBreakdown();
    const average = calculateAverage();
    const total = reviews.length;

    const tooltipContent = (
        <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" gutterBottom>Rating
                Breakdown</Typography>
            {[5, 4, 3, 2, 1].map(rating => {
                const count = breakdown[rating];
                const percentage = total > 0 ? ((count / total) * 100).toFixed(0) :
                    0;
                return (
                    <Box key={rating} sx={{
                        display: 'flex', alignItems: 'center', gap:
                            1, mb: 0.5
                    }}>
                        <Typography variant="caption">{rating}★</Typography>
                        <Box sx={{
                            flex: 1, height: 6, bgcolor: 'grey.300', borderRadius:
                                1
                        }}>
                            <Box sx={{
                                width: `${percentage}%`, height: '100%', bgcolor:
                                    'primary.main', borderRadius: 1
                            }} />
                        </Box>
                        <Typography variant="caption">{count}
                            ({percentage}%)</Typography>
                    </Box>
                );
            })}
        </Box>
    );

    const reviewsForRating = selectedRating
        ? reviews.filter(r => Math.round(r.rating) === selectedRating)
        : [];

    return (
        <>
            <Tooltip title={tooltipContent} arrow>
                <Box sx={{ display: 'inline-flex', cursor: 'pointer' }}>
                    {[1, 2, 3, 4, 5].map(rating => {
                        const filled = rating <= Math.round(average);
                        return (
                            <StarIcon
                                key={rating}
                                onClick={() => handleStarClick(rating)}
                                sx={{
                                    color: filled ? '#ffd700' : '#e0e0e0',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        transform: 'scale(1.2)', transition:
                                            'transform 0.2s'
                                    }
                                }}
                            />
                        );
                    })}
                    <Typography sx={{ ml: 1 }}>({total})</Typography>
                </Box>
            </Tooltip>

            <Dialog open={modalOpen} onClose={() => setModalOpen(false)}
                maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Typography variant="h6">{selectedRating}★ Reviews</Typography>
                        <IconButton onClick={() => setModalOpen(false)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {reviewsForRating.length === 0 ? (
                        <Typography color="text.secondary">No {selectedRating}-star
                            reviews yet</Typography>
                    ) : (
                        reviewsForRating.map((review, index) => (
                            <Box
                                key={index}
                                sx={{
                                    mb: 2,
                                    pb: 2,
                                    borderBottom: index < reviewsForRating.length - 1 ? '1px solid #e0e0e0' : 'none' 
                  }}
                            >
                                <StarRating rating={review.rating} />
                                <Typography variant="body2" sx={{
                                    mt: 1
                                }}>{review.comment}</Typography>
                            </Box>
                        ))
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
