import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function NavBar() {
    const navigate = useNavigate();
    const { isAuthenticated, logout, userEmail } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1, cursor: 'pointer' }}
                    onClick={() => navigate('/')}>
                    AirBrB
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button color="inherit" onClick={() => navigate('/')}>
                        All Listings
                    </Button>

                    {isAuthenticated() ? (
                        <>
                            <Button color="inherit" onClick={() => navigate('/hosted')}>
                                My Listings
                            </Button>
                            <Typography sx={{
                                display: 'flex', alignItems: 'center', mr: 2
                            }}>
                                {userEmail}
                            </Typography>
                            <Button color="inherit" onClick={handleLogout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button color="inherit" onClick={() => navigate('/login')}>
                                Login
                            </Button>
                            <Button color="inherit" onClick={() => navigate('/register')}>
                                Register
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}
