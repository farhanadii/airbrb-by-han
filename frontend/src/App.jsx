import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import NavBar from './components/navigation/NavBar';
import Login from './pages/Login';
import Register from './pages/Register';
import HostedListings from './pages/HostedListings';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import AllListings from './pages/AllListings';
import ViewListing from './pages/ViewListing';
import BookingRequests from './pages/BookingRequests';
import Profile from './pages/Profile';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationsProvider>
          <BrowserRouter>
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
              <NavBar />
              <Routes>
                <Route path="/" element={<AllListings />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/hosted" element={<HostedListings />} />
                <Route path="/hosted/new" element={<CreateListing />} />
                <Route path="/listings/:id" element={<ViewListing />} />
                <Route path="/listings/:id/edit" element={<EditListing />} />
                <Route path="/listings/:id/bookings" element={<BookingRequests />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Box>
          </BrowserRouter>
        </NotificationsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
