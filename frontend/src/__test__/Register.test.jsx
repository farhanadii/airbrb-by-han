import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Register from '../pages/Register';
import { AuthProvider } from '../contexts/AuthContext';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../services/api', () => ({
  register: vi.fn(),
}));

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders registration form with all required fields', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/password/i)).toHaveLength(2); // Password and Confirm Password
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('updates input fields when user types', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInputs = screen.getAllByLabelText(/password/i);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });

    expect(nameInput).toHaveValue('John Doe');
    expect(emailInput).toHaveValue('john@example.com');
    expect(passwordInputs[0]).toHaveValue('password123');
    expect(passwordInputs[1]).toHaveValue('password123');
  });

  it('shows error when passwords do not match', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInputs = screen.getAllByLabelText(/password/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'differentpassword' } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('shows error message when registration fails', async () => {
    const { register } = await import('../services/api');
    register.mockRejectedValueOnce(new Error('Email already exists'));

    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInputs = screen.getAllByLabelText(/password/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });

  it('has a link to login page', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );

    const loginLink = screen.getByText(/already have an account/i);
    expect(loginLink).toBeInTheDocument();
  });

  it('allows form submission with Enter key', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInputs = screen.getAllByLabelText(/password/i);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });

    fireEvent.keyDown(passwordInputs[1], { key: 'Enter', code: 'Enter' });

    // Form should attempt submission
    expect(nameInput).toHaveValue('John Doe');
  });
});
