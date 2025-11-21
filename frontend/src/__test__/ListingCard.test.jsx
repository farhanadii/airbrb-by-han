import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ListingCard from '../components/listings/ListingCard';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ListingCard Component', () => {
  const mockListing = {
    id: '123',
    title: 'Beautiful Beach House',
    price: 150,
    thumbnail: 'https://example.com/image.jpg',
    metadata: {
      propertyType: 'House',
      bathrooms: 2,
      bedrooms: [
        { beds: 2, type: 'Double' },
        { beds: 1, type: 'Single' }
      ]
    },
    reviews: [
      { rating: 5 },
      { rating: 4 }
    ]
  };

  it('renders listing card with correct information', () => {
    render(
      <BrowserRouter>
        <ListingCard listing={mockListing} isHostView={false} />
      </BrowserRouter>
    );

    expect(screen.getByText('Beautiful Beach House')).toBeInTheDocument();
    expect(screen.getByText(/\$150/)).toBeInTheDocument();
    expect(screen.getByText('House')).toBeInTheDocument();
    expect(screen.getByText(/3 beds/)).toBeInTheDocument();
    expect(screen.getByText(/2 baths/)).toBeInTheDocument();
  });

  it('displays average rating correctly', () => {
    render(
      <BrowserRouter>
        <ListingCard listing={mockListing} isHostView={false} />
      </BrowserRouter>
    );

    expect(screen.getByText('4.50')).toBeInTheDocument();
  });

  it('navigates to listing details when clicked', () => {
    render(
      <BrowserRouter>
        <ListingCard listing={mockListing} isHostView={false} />
      </BrowserRouter>
    );

    const card = screen.getByText('Beautiful Beach House').closest('.MuiCard-root');
    fireEvent.click(card);

    expect(mockNavigate).toHaveBeenCalledWith('/listings/123');
  });

  it('shows edit and delete buttons in host view', () => {
    const mockDelete = vi.fn();

    render(
      <BrowserRouter>
        <ListingCard listing={mockListing} onDelete={mockDelete} isHostView={true} />
      </BrowserRouter>
    );

    const editIcon = screen.getByTestId('EditIcon');
    const deleteIcon = screen.getByTestId('DeleteIcon');

    expect(editIcon).toBeInTheDocument();
    expect(deleteIcon).toBeInTheDocument();
  });

  it('handles missing thumbnail with placeholder', () => {
    const listingWithoutThumbnail = { ...mockListing, thumbnail: null };

    render(
      <BrowserRouter>
        <ListingCard listing={listingWithoutThumbnail} isHostView={false} />
      </BrowserRouter>
    );

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', expect.stringContaining('placeholder'));
  });
});
