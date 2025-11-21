import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StarRating from '../components/common/StarRating';

describe('StarRating Component', () => {
  it('renders star rating component', () => {
    render(<StarRating rating={4.5} reviewCount={10} />);

    const stars = screen.getAllByTestId('StarIcon');
    expect(stars.length).toBeGreaterThan(0);
  });

  it('displays full stars correctly', () => {
    render(<StarRating rating={5} reviewCount={10} />);

    const stars = screen.getAllByTestId('StarIcon');
    expect(stars).toHaveLength(5);
  });

  it('displays review count when provided', () => {
    render(<StarRating rating={4} reviewCount={25} />);

    expect(screen.getByText('(25)')).toBeInTheDocument();
  });

  it('handles zero rating', () => {
    render(<StarRating rating={0} reviewCount={0} />);

    expect(screen.getByText('(0)')).toBeInTheDocument();
  });

  it('renders without review count', () => {
    const { container } = render(<StarRating rating={3.5} />);

    expect(container).toBeInTheDocument();
  });

  it('displays half star for ratings with decimals', () => {
    render(<StarRating rating={3.7} reviewCount={5} />);

    // Should have a half star icon
    const halfStar = screen.queryByTestId('StarHalfIcon');
    expect(halfStar).toBeInTheDocument();
  });
});
