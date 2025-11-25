import { Box, Paper, Typography, ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material';
import { useState } from 'react';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InsightsIcon from '@mui/icons-material/Insights';

export default function ProfitsGraph({ bookings, listings }) {
  const [viewMode, setViewMode] = useState('daily');
  const calculateDailyProfits = () => {
    const today = new Date();
    const dailyProfits = {};

    for (let i = 0; i <= 30; i++) {
      dailyProfits[i] = 0;
    }

    bookings.forEach(booking => {
      if (booking.status !== 'accepted') return;

      const start = new Date(booking.dateRange.start);
      const end = new Date(booking.dateRange.end);

      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      const totalPrice = booking.totalPrice || (() => {
        const listing = listings.find(l => l.id === booking.listingId);
        return listing ? listing.price * nights : 0;
      })();

      const pricePerDay = nights > 0 ? totalPrice / nights : 0;

      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const daysAgo = Math.floor((today - d) / (1000 * 60 * 60 * 24));

        if (daysAgo >= 0 && daysAgo <= 30) {
          dailyProfits[daysAgo] += pricePerDay;
        }
      }
    });

    return dailyProfits;
  };

  const calculateMonthlyProfits = () => {
    const today = new Date();
    const monthlyProfits = {};

    for (let i = 0; i < 12; i++) {
      monthlyProfits[i] = 0;
    }

    bookings.forEach(booking => {
      if (booking.status !== 'accepted') return;

      const start = new Date(booking.dateRange.start);
      const end = new Date(booking.dateRange.end);
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      const totalPrice = booking.totalPrice || (() => {
        const listing = listings.find(l => l.id === booking.listingId);
        return listing ? listing.price * nights : 0;
      })();

      const pricePerDay = nights > 0 ? totalPrice / nights : 0;

      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const monthsAgo = (today.getFullYear() - d.getFullYear()) * 12 + (today.getMonth() - d.getMonth());

        if (monthsAgo >= 0 && monthsAgo < 12) {
          monthlyProfits[monthsAgo] += pricePerDay;
        }
      }
    });

    return monthlyProfits;
  };

  const dailyProfits = calculateDailyProfits();
  const monthlyProfits = calculateMonthlyProfits();

  const profits = viewMode === 'daily' ? dailyProfits : monthlyProfits;
  const totalProfit = Object.values(profits).reduce((sum, p) => sum + p, 0);
  const maxProfit = Math.max(...Object.values(profits), 1);
  const hasData = totalProfit > 0;

  return (
    <Paper sx={{
      p: 3,
      borderRadius: 3,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
      color: 'white'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InsightsIcon sx={{ fontSize: 28, color: 'white' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
            Earnings Overview
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newMode) => newMode && setViewMode(newMode)}
          size="small"
          sx={{
            bgcolor: 'rgba(255,255,255,0.15)',
            borderRadius: 2,
            '& .MuiToggleButton-root': {
              color: 'rgba(255,255,255,0.7)',
              border: 'none',
              px: 2,
              py: 0.5,
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'none',
              '&.Mui-selected': {
                bgcolor: 'rgba(255,255,255,0.95)',
                color: '#6366F1',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,1)'
                }
              },
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)'
              }
            }
          }}
        >
          <ToggleButton value="daily">Last 30 Days</ToggleButton>
          <ToggleButton value="monthly">Last 12 Months</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {!hasData ? (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 200,
          bgcolor: 'rgba(255,255,255,0.1)',
          borderRadius: 2,
          border: '2px dashed rgba(255,255,255,0.3)'
        }}>
          <TrendingUpIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5, color: 'white' }} />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: 'white' }}>
            No Bookings Yet
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, textAlign: 'center', maxWidth: 300, color: 'white' }}>
            Once guests book your properties, you&apos;ll see your earnings here. Make sure your listings are published!
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 0.5,
            height: 200,
            bgcolor: 'rgba(255,255,255,0.1)',
            p: 2,
            borderRadius: 2
          }}>
            {viewMode === 'daily' ? (
              Array.from({ length: 31 }, (_, i) => 30 - i).map(daysAgo => {
                const profit = profits[daysAgo] || 0;
                const heightPercent = maxProfit > 0 ? (profit / maxProfit) * 100 : 0;
                const date = new Date();
                date.setDate(date.getDate() - daysAgo);

                return (
                  <Tooltip
                    key={daysAgo}
                    title={
                      <Box>
                        <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', mb: 0.3 }}>
                          ${profit.toFixed(2)}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Typography>
                      </Box>
                    }
                    placement="top"
                    arrow
                    componentsProps={{
                      tooltip: {
                        sx: {
                          bgcolor: 'rgba(0, 0, 0, 0.9)',
                          borderRadius: 1.5,
                          px: 1.5,
                          py: 1
                        }
                      },
                      arrow: {
                        sx: { color: 'rgba(0, 0, 0, 0.9)' }
                      }
                    }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        height: `${heightPercent}%`,
                        minHeight: profit > 0 ? 4 : 2,
                        bgcolor: profit > 0 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.1)',
                        borderRadius: '3px 3px 0 0',
                        position: 'relative',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: '#FFD700',
                          transform: 'scaleY(1.05)',
                          cursor: 'pointer'
                        }
                      }}
                    />
                  </Tooltip>
                );
              })
            ) : (
              Array.from({ length: 12 }, (_, i) => 11 - i).map(monthsAgo => {
                const profit = profits[monthsAgo] || 0;
                const heightPercent = maxProfit > 0 ? (profit / maxProfit) * 100 : 0;
                const date = new Date();
                date.setMonth(date.getMonth() - monthsAgo);

                return (
                  <Tooltip
                    key={monthsAgo}
                    title={
                      <Box>
                        <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', mb: 0.3 }}>
                          ${profit.toFixed(2)}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                          {date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </Typography>
                      </Box>
                    }
                    placement="top"
                    arrow
                    componentsProps={{
                      tooltip: {
                        sx: {
                          bgcolor: 'rgba(0, 0, 0, 0.9)',
                          borderRadius: 1.5,
                          px: 1.5,
                          py: 1
                        }
                      },
                      arrow: {
                        sx: { color: 'rgba(0, 0, 0, 0.9)' }
                      }
                    }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        height: `${heightPercent}%`,
                        minHeight: profit > 0 ? 4 : 2,
                        bgcolor: profit > 0 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.1)',
                        borderRadius: '3px 3px 0 0',
                        position: 'relative',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: '#FFD700',
                          transform: 'scaleY(1.05)',
                          cursor: 'pointer'
                        }
                      }}
                    />
                  </Tooltip>
                );
              })
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, opacity: 0.8 }}>
            <Typography variant="caption" sx={{ color: 'white' }}>
              {viewMode === 'daily' ? '30 days ago' : '12 months ago'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'white' }}>
              {viewMode === 'daily' ? 'Today' : 'This month'}
            </Typography>
          </Box>
        </>
      )}

      <Box sx={{
        mt: 3,
        pt: 2,
        borderTop: '1px solid rgba(255,255,255,0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
          Total Earnings
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
          ${totalProfit.toFixed(2)}
        </Typography>
      </Box>
    </Paper>
  );
}
