import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import NavBar from '../components/navigation/NavBar';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationsProvider } from '../contexts/NotificationsContext';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../services/api', () => ({
  logout: vi.fn(() => Promise.resolve()),
  getAllBookings: vi.fn(() => Promise.resolve({ bookings: [] })),
  getAllListings: vi.fn(() => Promise.resolve({ listings: [] })),
}));

describe('NavBar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders logo and navigation links', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <NotificationsProvider>
            <NavBar />
          </NotificationsProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/airbrb/i)).toBeInTheDocument();
    expect(screen.getByText(/explore/i)).toBeInTheDocument();
  });

  it('shows login and sign up buttons when not authenticated', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <NotificationsProvider>
            <NavBar />
          </NotificationsProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/log in/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  it('shows user email and host button when authenticated', () => {
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('userEmail', 'test@example.com');

    render(
      <BrowserRouter>
        <AuthProvider>
          <NotificationsProvider>
            <NavBar />
          </NotificationsProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    // User email appears in avatar (first letter T)
    expect(screen.getByText('T')).toBeInTheDocument();
    expect(screen.getByText(/my listings/i)).toBeInTheDocument();
  });

  it('navigates to home page when logo is clicked', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <NotificationsProvider>
            <NavBar />
          </NotificationsProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    const logo = screen.getByText(/airbrb/i);
    fireEvent.click(logo);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('opens user menu when user avatar is clicked', async () => {
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('userEmail', 'test@example.com');

    render(
      <BrowserRouter>
        <AuthProvider>
          <NotificationsProvider>
            <NavBar />
          </NotificationsProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    const userAvatar = screen.getByText('T'); // First letter of email
    fireEvent.click(userAvatar);

    await waitFor(() => {
      expect(screen.getByText(/profile/i)).toBeInTheDocument();
      expect(screen.getByText(/logout/i)).toBeInTheDocument();
    });
  });

  it('logs out user when logout button is clicked', async () => {
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('userEmail', 'test@example.com');

    const { logout } = await import('../services/api');

    render(
      <BrowserRouter>
        <AuthProvider>
          <NotificationsProvider>
            <NavBar />
          </NotificationsProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    // Open user menu
    const userAvatar = screen.getByText('T');
    fireEvent.click(userAvatar);

    // Click logout
    await waitFor(() => {
      const logoutButton = screen.getByText(/logout/i);
      fireEvent.click(logoutButton);
    });

    await waitFor(() => {
      expect(logout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('shows notifications panel when authenticated', () => {
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('userEmail', 'test@example.com');

    render(
      <BrowserRouter>
        <AuthProvider>
          <NotificationsProvider>
            <NavBar />
          </NotificationsProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    // Notifications icon should be present
    const notificationIcon = screen.getByTestId('NotificationsIcon');
    expect(notificationIcon).toBeInTheDocument();
  });

  it('navigates to hosted listings when My Listings button is clicked', () => {
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('userEmail', 'test@example.com');

    render(
      <BrowserRouter>
        <AuthProvider>
          <NotificationsProvider>
            <NavBar />
          </NotificationsProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    const myListingsButton = screen.getByText(/my listings/i);
    fireEvent.click(myListingsButton);

    expect(mockNavigate).toHaveBeenCalledWith('/hosted');
  });
});
