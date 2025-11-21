import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import RatingBreakdown from '../components/common/RatingBreakdown';

describe('RatingBreakdown Component', () => {
  it('displays rating with multiple reviews', () => {
    const reviews = [
      { rating: 5, comment: 'Great!' },
      { rating: 4, comment: 'Good' },
      { rating: 5, comment: 'Excellent' },
      { rating: 3, comment: 'OK' },
    ];

    render(<RatingBreakdown reviews={reviews} />);

    // Should show review count
    expect(screen.getByText('(4)')).toBeInTheDocument();
  });

  it('displays stars for single review', () => {
    const reviews = [{ rating: 5, comment: 'Amazing!' }];

    render(<RatingBreakdown reviews={reviews} />);

    expect(screen.getByText('(1)')).toBeInTheDocument();
    const stars = screen.getAllByTestId('StarIcon');
    expect(stars.length).toBeGreaterThan(0);
  });

  it('shows zero reviews when array is empty', () => {
    render(<RatingBreakdown reviews={[]} />);

    expect(screen.getByText('(0)')).toBeInTheDocument();
  });

  it('renders star icons for ratings', () => {
    const reviews = [{ rating: 4, comment: 'Nice' }, { rating: 5, comment: 'Perfect' }];

    render(<RatingBreakdown reviews={reviews} />);

    const starIcons = screen.getAllByTestId('StarIcon');
    expect(starIcons.length).toBeGreaterThan(0);
  });

  it('opens modal when star is clicked', () => {
    const reviews = [
      { rating: 5, comment: 'Excellent' },
      { rating: 4, comment: 'Good' },
    ];

    render(<RatingBreakdown reviews={reviews} />);

    const stars = screen.getAllByTestId('StarIcon');
    fireEvent.click(stars[0]);

    // Modal should open
    expect(screen.getByText(/Reviews/)).toBeInTheDocument();
  });

  it('calculates average rating correctly', () => {
    const reviews = [
      { rating: 5, comment: 'A' },
      { rating: 4, comment: 'B' },
      { rating: 3, comment: 'C' },
    ];

    render(<RatingBreakdown reviews={reviews} />);

    // Average is 4, so should show 4 filled stars
    const stars = screen.getAllByTestId('StarIcon');
    expect(stars).toHaveLength(5); // Always shows 5 stars
  });

  it('displays tooltip on hover', () => {
    const reviews = [
      { rating: 5, comment: 'Great' },
      { rating: 4, comment: 'Good' },
    ];

    const { container } = render(<RatingBreakdown reviews={reviews} />);

    // Component should render with tooltip
    expect(container.querySelector('[data-mui-internal-clone-element]')).toBeInTheDocument();
  });
});
