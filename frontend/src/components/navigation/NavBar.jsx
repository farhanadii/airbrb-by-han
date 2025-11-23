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
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'white',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease'
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 64, sm: 80 }, px: { xs: 2, sm: 4, md: 6 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            flexGrow: { xs: 1, md: 0 },
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.02)'
            }
          }}
          onClick={() => navigate('/')}
        >
          <HomeIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1, transition: 'all 0.3s ease' }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              letterSpacing: '-0.5px'
            }}
          >
            airbrb
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: 1 }}>
          <Button
            sx={{
              color: '#222',
              fontWeight: 500,
              textTransform: 'none',
              px: 2.5,
              py: 1,
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#f7f7f7',
                transform: 'translateY(-1px)'
              }
            }}
            onClick={() => navigate('/')}
          >
            Explore
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          {isAuthenticated() ? (
            <>
              <Button
                sx={{
                  color: '#222',
                  fontWeight: 500,
                  textTransform: 'none',
                  px: 2.5,
                  py: 1,
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#f7f7f7',
                    transform: 'translateY(-1px)'
                  },
                  display: { xs: 'none', sm: 'inline-flex' }
                }}
                onClick={() => navigate('/hosted')}
              >
                Host
              </Button>
              <NotificationsPanel />
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  border: '1px solid rgba(0,0,0,0.12)',
                  borderRadius: 8,
                  px: 1.5,
                  py: 0.5,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    borderColor: 'rgba(0,0,0,0.18)',
                    transform: 'translateY(-1px)'
                  }
                }}
                onClick={handleMenuOpen}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'primary.main',
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  {userEmail?.charAt(0).toUpperCase()}
                </Avatar>
              </Box>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 220,
                    borderRadius: 2.5,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }
                }}
                TransitionProps={{
                  timeout: 300
                }}
              >
                <Box sx={{ px: 2.5, py: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', fontSize: '0.9rem' }}>
                    {userEmail}
                  </Typography>
                </Box>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem
                  onClick={() => { navigate('/hosted'); handleMenuClose(); }}
                  sx={{
                    py: 1.5,
                    px: 2.5,
                    fontSize: '0.875rem',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: '#f7f7f7'
                    }
                  }}
                >
                  My Listings
                </MenuItem>
                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    py: 1.5,
                    px: 2.5,
                    fontSize: '0.875rem',
                    color: 'error.main',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(193, 53, 21, 0.08)'
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
                  color: '#222',
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 2.5,
                  py: 1,
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#f7f7f7',
                    transform: 'translateY(-1px)'
                  }
                }}
                onClick={() => navigate('/login')}
              >
                Log in
              </Button>
              <Button
                variant="contained"
                color="primary"
                sx={{
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  borderRadius: 3,
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
                    transform: 'translateY(-2px)'
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
