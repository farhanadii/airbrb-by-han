import { AppBar, Toolbar, Button, Box, Typography, Avatar, Menu, MenuItem, Divider } from '@mui/material';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationsPanel from '../common/NotificationsPanel';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, userEmail } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const isActive = (path) => location.pathname === path;

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
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'white',
        borderBottom: '1px solid #E5E7EB'
      }}
    >
      <Toolbar sx={{ minHeight: 70, px: { xs: 2, sm: 4, md: 6 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            mr: { xs: 'auto', md: 6 }
          }}
          onClick={() => navigate('/')}
        >
          <HomeWorkIcon sx={{ fontSize: 32, color: '#6366F1', mr: 1.5 }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#1F2937',
              fontSize: '1.5rem',
              letterSpacing: '-0.5px'
            }}
          >
            AirBrB
          </Typography>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, flex: 1, justifyContent: 'center' }}>
          <Button
            sx={{
              color: isActive('/') ? '#6366F1' : '#374151',
              fontWeight: isActive('/') ? 600 : 500,
              textTransform: 'none',
              px: 2.5,
              py: 1,
              borderRadius: 2,
              fontSize: '0.938rem',
              bgcolor: isActive('/') ? '#EEF2FF' : 'transparent',
              position: 'relative',
              '&:hover': {
                bgcolor: '#F3F4F6',
                color: '#6366F1'
              },
              '&::after': isActive('/') ? {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60%',
                height: 2,
                bgcolor: '#6366F1',
                borderRadius: '2px 2px 0 0'
              } : {}
            }}
            onClick={() => navigate('/')}
          >
            Explore
          </Button>
          {isAuthenticated() && (
            <Button
              sx={{
                color: isActive('/hosted') ? '#6366F1' : '#374151',
                fontWeight: isActive('/hosted') ? 600 : 500,
                textTransform: 'none',
                px: 2.5,
                py: 1,
                borderRadius: 2,
                fontSize: '0.938rem',
                bgcolor: isActive('/hosted') ? '#EEF2FF' : 'transparent',
                position: 'relative',
                '&:hover': {
                  bgcolor: '#F3F4F6',
                  color: '#6366F1'
                },
                '&::after': isActive('/hosted') ? {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60%',
                  height: 2,
                  bgcolor: '#6366F1',
                  borderRadius: '2px 2px 0 0'
                } : {}
              }}
              onClick={() => navigate('/hosted')}
            >
              My Listings
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', ml: 'auto' }}>
          {isAuthenticated() ? (
            <>
              <NotificationsPanel />
              <Button
                onClick={handleMenuOpen}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  border: '1px solid #E5E7EB',
                  borderRadius: 50,
                  pl: 1.5,
                  pr: 0.5,
                  py: 0.5,
                  minWidth: 'auto',
                  textTransform: 'none',
                  '&:hover': {
                    border: '1px solid #D1D5DB',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <MenuIcon sx={{ fontSize: 18, color: '#6B7280' }} />
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: '#6366F1',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  {userEmail?.charAt(0).toUpperCase()}
                </Avatar>
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #E5E7EB'
                  }
                }}
              >
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #F3F4F6' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                    {userEmail}
                  </Typography>
                </Box>
                <MenuItem
                  onClick={() => { navigate('/profile'); handleMenuClose(); }}
                  sx={{
                    py: 1.25,
                    px: 2,
                    fontSize: '0.875rem',
                    color: '#374151',
                    '&:hover': {
                      bgcolor: '#F9FAFB'
                    }
                  }}
                >
                  <PersonIcon sx={{ mr: 1.5, fontSize: '1.1rem', color: '#6B7280' }} />
                  Profile
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    py: 1.25,
                    px: 2,
                    fontSize: '0.875rem',
                    color: '#DC2626',
                    '&:hover': {
                      bgcolor: '#FEF2F2'
                    }
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                sx={{
                  color: '#374151',
                  fontWeight: 500,
                  textTransform: 'none',
                  px: 2.5,
                  py: 1,
                  borderRadius: 2,
                  fontSize: '0.938rem',
                  '&:hover': {
                    bgcolor: '#F3F4F6'
                  }
                }}
                onClick={() => navigate('/login')}
              >
                Log in
              </Button>
              <Button
                variant="contained"
                sx={{
                  fontWeight: 500,
                  textTransform: 'none',
                  px: 2.5,
                  py: 1,
                  borderRadius: 2,
                  fontSize: '0.938rem',
                  bgcolor: '#6366F1',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#4F46E5',
                    boxShadow: 'none'
                  }
                }}
                onClick={() => navigate('/register')}
              >
                Sign up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
