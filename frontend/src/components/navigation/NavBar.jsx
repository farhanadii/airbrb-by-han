import { AppBar, Toolbar, Button, Box, Typography, Avatar, Menu, MenuItem, Divider } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationsPanel from '../common/NotificationsPanel';
import HomeIcon from '@mui/icons-material/Home';

export default function NavBar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, userEmail } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      handleMenuClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
      <Toolbar sx={{ minHeight: { xs: 64, sm: 80 }, px: { xs: 2, sm: 4, md: 6 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexGrow: { xs: 1, md: 0 } }} onClick={() => navigate('/')}>
          <HomeIcon sx={{ fontSize: 32, color: '#FF385C', mr: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF385C', fontSize: { xs: '1.25rem', sm: '1.5rem' }, letterSpacing: '-0.5px' }}>
                        airbrb
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: 1 }}>
          <Button sx={{ color: '#222', fontWeight: 500, textTransform: 'none', px: 2, borderRadius: 3, '&:hover': { bgcolor: '#f7f7f7' } }} onClick={() => navigate('/')}>
                        Explore
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          {isAuthenticated() ? (
            <>
              <Button sx={{ color: '#222', fontWeight: 500, textTransform: 'none', px: 2, borderRadius: 3, '&:hover': { bgcolor: '#f7f7f7' }, display: { xs: 'none', sm: 'inline-flex' } }} onClick={() => navigate('/hosted')}>
                                Host
              </Button>
              <NotificationsPanel />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #ddd', borderRadius: 6, px: 1.5, py: 0.5, cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 2px 4px rgba(0,0,0,0.18)' } }} onClick={handleMenuOpen}>
                <Avatar sx={{ width: 30, height: 30, bgcolor: '#717171', fontSize: '0.875rem' }}>
                  {userEmail?.charAt(0).toUpperCase()}
                </Avatar>
              </Box>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} PaperProps={{ sx: { mt: 1, minWidth: 200, borderRadius: 2, boxShadow: '0 2px 16px rgba(0,0,0,0.12)' } }}>
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#222' }}>{userEmail}</Typography>
                </Box>
                <Divider />
                <MenuItem onClick={() => { navigate('/hosted'); handleMenuClose(); }} sx={{ py: 1.5, fontSize: '0.875rem' }}>My Listings</MenuItem>
                <MenuItem onClick={handleLogout} sx={{ py: 1.5, fontSize: '0.875rem' }}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button sx={{ color: '#222', fontWeight: 600, textTransform: 'none', px: 2, borderRadius: 3, '&:hover': { bgcolor: '#f7f7f7' } }} onClick={() => navigate('/login')}>
                                Log in
              </Button>
              <Button variant="contained" sx={{ bgcolor: '#FF385C', color: 'white', fontWeight: 600, textTransform: 'none', px: 2.5, borderRadius: 3, boxShadow: 'none', '&:hover': { bgcolor: '#E31C5F', boxShadow: 'none' } }} onClick={() => navigate('/register')}>
                                Sign up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
