import { useState } from 'react';
import {
  IconButton, Badge, Menu, MenuItem, Typography, Box,
  Divider, Button, ListItemText
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useNavigate } from 'react-router-dom';

export default function NotificationsPanel() {
  const [anchorEl, setAnchorEl] = useState(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const navigate = useNavigate();

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    handleClose();

    if (notification.type === 'booking_request') {
      navigate(`/listings/${notification.listingId}/bookings`);
    } else {
      navigate(`/listings/${notification.listingId}`);
    }
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          color: '#222',
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: 'rgba(0,0,0,0.04)',
            transform: 'scale(1.05)'
          }
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              bgcolor: 'primary.main',
              color: 'white',
              fontWeight: 600,
              boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)'
            }
          }}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 450,
            borderRadius: 2.5,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.05)',
            mt: 1.5
          }
        }}
        TransitionProps={{
          timeout: 300
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'rgba(0,0,0,0.02)'
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1.1rem',
              color: '#222',
              letterSpacing: '-0.01em'
            }}
          >
            Notifications
          </Typography>
          {notifications.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Button
                size="small"
                onClick={markAllAsRead}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  color: '#717171',
                  fontWeight: 500,
                  minWidth: 'auto',
                  px: 1.5,
                  py: 0.5,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: 'rgba(99, 102, 241, 0.08)'
                  }
                }}
              >
                Mark all read
              </Button>
              <Button
                size="small"
                onClick={clearNotifications}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  color: '#717171',
                  fontWeight: 500,
                  minWidth: 'auto',
                  px: 1.5,
                  py: 0.5,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: 'rgba(99, 102, 241, 0.08)'
                  }
                }}
              >
                Clear
              </Button>
            </Box>
          )}
        </Box>
        <Divider />

        {notifications.length === 0 ? (
          <MenuItem
            disabled
            sx={{
              py: 3,
              justifyContent: 'center'
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: '0.9rem'
              }}
            >
              No notifications
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                bgcolor: notification.read ? 'transparent' : 'rgba(99, 102, 241, 0.04)',
                borderLeft: notification.read ? 'none' : '3px solid',
                borderLeftColor: notification.read ? 'transparent' : 'primary.main',
                py: 1.5,
                px: 2.5,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: notification.read ? 'rgba(0,0,0,0.04)' : 'rgba(255,56,92,0.08)'
                }
              }}
            >
              <ListItemText
                primary={notification.message}
                secondary={notification.timestamp.toLocaleString()}
                primaryTypographyProps={{
                  fontWeight: notification.read ? 'normal' : 600,
                  fontSize: '0.9rem',
                  color: '#222'
                }}
                secondaryTypographyProps={{
                  fontSize: '0.75rem'
                }}
              />
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}