import { Box, Paper, Typography } from '@mui/material';

export default function ProfitsGraph({ bookings, listings }) {
    const calculateDailyProfits = () => {
        const today = new Date();
        const dailyProfits = {};

        for (let i = 0; i <= 30; i++) {
            dailyProfits[i] = 0;
        }

        bookings.forEach(booking => {
            if (booking.status !== 'accepted') return;

            const listing = listings.find(l => l.id === booking.listingId);
            if (!listing) return;

            const start = new Date(booking.dateRange.start);
            const end = new Date(booking.dateRange.end);

            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const daysAgo = Math.floor((today - d) / (1000 * 60 * 60 * 24));

                if (daysAgo >= 0 && daysAgo <= 30) {
                    dailyProfits[daysAgo] += listing.price;
                }
            }
        });

        return dailyProfits;
    };

    const dailyProfits = calculateDailyProfits();
    const maxProfit = Math.max(...Object.values(dailyProfits), 1);

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Profit Over Last 30 Days
            </Typography>

            <Box sx={{
                display: 'flex', alignItems: 'flex-end', gap: 0.5, height:
                    200, mt: 2
            }}>
                {Array.from({ length: 31 }, (_, i) => 30 - i).map(daysAgo => {
                    const profit = dailyProfits[daysAgo] || 0;
                    const heightPercent = maxProfit > 0 ? (profit / maxProfit) * 100 :
                        0;

                    return (
                        <Box
                            key={daysAgo}
                            sx={{
                                flex: 1,
                                height: `${heightPercent}%`,
                                minHeight: profit > 0 ? 4 : 0,
                                bgcolor: 'primary.main',
                                borderRadius: '2px 2px 0 0',
                                position: 'relative',
                                '&:hover': {
                                    bgcolor: 'primary.dark',
                                    cursor: 'pointer'
                                }
                            }}
                            title={`${daysAgo} days ago: $${profit.toFixed(2)}`}
                        />
                    );
                })}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">30 days
                    ago</Typography>
                <Typography variant="caption"
                    color="text.secondary">Today</Typography>
            </Box>

            <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                    Total profit (last 30 days):
                    ${Object.values(dailyProfits).reduce((sum, p) => sum + p, 0).toFixed(2)}
                </Typography>
            </Box>
        </Paper>
    );
}
