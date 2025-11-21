import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <BrowserRouter>
          <NavBar />
          <Routes>
            <Route path="/" element={<AllListings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/hosted" element={<HostedListings />} />
            <Route path="/hosted/new" element={<CreateListing />} />
            <Route path="/listings/:id" element={<ViewListing />} />
            <Route path="/listings/:id/edit" element={<EditListing />} />
            <Route path="/listings/:id/bookings" element={<BookingRequests />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </NotificationsProvider>
    </AuthProvider>
  );
}

export default App;
