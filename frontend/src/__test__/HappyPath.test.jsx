import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock API
vi.mock('../services/api', () => ({
  register: vi.fn(() => Promise.resolve({ token: 'mock-token' })),
  login: vi.fn(() => Promise.resolve({ token: 'mock-token' })),
  logout: vi.fn(() => Promise.resolve()),
  getAllListings: vi.fn(() => Promise.resolve({ listings: [] })),
  createListing: vi.fn(() => Promise.resolve({ listingId: '123' })),
  getAllBookings: vi.fn(() => Promise.resolve({ bookings: [] })),
}));

describe('Happy Path - User Registration and Listing Creation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('completes full user journey: register, create listing, and logout', async () => {
    const { register, createListing } = await import('../services/api');

    render(<App />);

    // Step 1: Navigate to registration page
    const registerNavLink = screen.getByText(/sign up/i);
    fireEvent.click(registerNavLink);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    });

    // Step 2: Fill out registration form
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInputs = screen.getAllByLabelText(/password/i);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

    // Step 3: Submit registration
    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith('john@example.com', 'password123', 'John Doe');
    });

    // Step 4: After registration, user should be logged in and see their avatar
    await waitFor(() => {
      expect(screen.getByText('J')).toBeInTheDocument(); // Avatar with first letter
      expect(screen.getByText(/my listings/i)).toBeInTheDocument();
    });

    // Step 5: Navigate to hosted listings (create new listing)
    const myListingsButton = screen.getByRole('button', { name: /my listings/i });
    fireEvent.click(myListingsButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /my listings/i })).toBeInTheDocument();
    });

    // Step 6: Click create new listing button
    const createListingButton = screen.getByRole('button', { name: /create new listing/i });
    fireEvent.click(createListingButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create new listing/i })).toBeInTheDocument();
    });

    // Step 7: Fill out listing form
    const titleInput = screen.getByLabelText(/listing title/i);
    const addressInput = screen.getByLabelText(/address/i);
    const priceInput = screen.getByLabelText(/price per night/i);

    fireEvent.change(titleInput, { target: { value: 'Beautiful Beach House' } });
    fireEvent.change(addressInput, { target: { value: '123 Beach St, Sydney' } });
    fireEvent.change(priceInput, { target: { value: '150' } });

    // Step 8: Submit listing
    const submitButton = screen.getByRole('button', { name: /create listing/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createListing).toHaveBeenCalled();
    });

    // Step 9: Verify user is redirected back to hosted listings
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /my listings/i })).toBeInTheDocument();
    });

    // Step 10: Logout
    const userAvatar = screen.getByText('J'); // Click on avatar
    fireEvent.click(userAvatar);

    await waitFor(() => {
      const logoutButton = screen.getByText(/logout/i);
      fireEvent.click(logoutButton);
    });

    // Step 11: Verify user is logged out and sees login button
    await waitFor(() => {
      expect(screen.getByText(/log in/i)).toBeInTheDocument();
      expect(screen.queryByText('J')).not.toBeInTheDocument(); // Avatar should be gone
    });
  });
});
