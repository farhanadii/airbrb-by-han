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
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 360, maxHeight: 400 }
        }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {notifications.length > 0 && (
            <Box>
              <Button size="small" onClick={markAllAsRead}>Mark all read</Button>
              <Button size="small" onClick={clearNotifications}>Clear</Button>
            </Box>
          )}
        </Box>
        <Divider />

        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
                            No notifications
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                bgcolor: notification.read ? 'transparent' : 'action.hover',
                '&:hover': { bgcolor: 'action.selected' }
              }}
            >
              <ListItemText
                primary={notification.message}
                secondary={notification.timestamp.toLocaleString()}
                primaryTypographyProps={{
                  fontWeight: notification.read ? 'normal' : 'bold'
                }}
              />
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}