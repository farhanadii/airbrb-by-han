# Testing Documentation

## Overview

This document outlines the testing approach for the AirBrB frontend application. The application uses **Vitest** as the test framework with **React Testing Library** for component testing.

## Testing Stack

- **Test Framework**: Vitest v3.0.8
- **Testing Library**: @testing-library/react
- **Test Environment**: jsdom (simulated browser environment)
- **Mocking**: Vitest's built-in mocking capabilities

## Test Structure

### Test Files Location
All test files are located in `src/__test__/` directory with the `.test.jsx` extension.

### Current Test Coverage

I have implemented **40 tests** across **8 test files**:

1. **HappyPath.test.jsx** (1 test)
   - End-to-end user journey test covering registration → listing creation → logout

2. **NavBar.test.jsx** (8 tests)
   - Logo and navigation links rendering
   - Authentication state handling
   - User menu functionality
   - Logout functionality
   - Notifications panel visibility
   - Navigation routing

3. **ListingCard.test.jsx** (5 tests)
   - Card rendering with listing information
   - Average rating display
   - Navigation to listing details
   - Host view edit/delete buttons
   - Placeholder image handling

4. **StarRating.test.jsx** (6 tests)
   - Star rating component rendering
   - Full stars display
   - Review count display
   - Zero rating handling
   - Half star rendering for decimal ratings

5. **RatingBreakdown.test.jsx** (7 tests)
   - Multiple reviews display
   - Single review display
   - Empty reviews handling
   - Star icons rendering
   - Modal opening on interaction
   - Average rating calculation
   - Tooltip rendering

6. **Login.test.jsx** (5 tests)
   - Form rendering
   - Input field handling
   - Successful login flow
   - Error handling
   - Navigation to register

7. **Register.test.jsx** (6 tests)
   - Form rendering with all fields
   - Input handling
   - Successful registration
   - Password mismatch validation
   - Error handling
   - Navigation to login

8. **example.test.jsx** (2 tests)
   - App rendering
   - Navigation presence

## Testing Approach

### Component Testing
- **Isolation**: Each component is tested in isolation with mocked dependencies
- **User Interactions**: Tests simulate real user interactions (clicks, form inputs)
- **State Management**: Tests verify proper state updates and context usage
- **API Mocking**: External API calls are mocked using Vitest's `vi.mock()`

### Happy Path Testing
The `HappyPath.test.jsx` file contains a comprehensive end-to-end test that simulates a complete user journey:

1. Navigate to registration page
2. Fill out and submit registration form
3. Verify user is logged in (avatar displayed)
4. Navigate to hosted listings
5. Create a new listing
6. Verify listing creation
7. Logout
8. Verify user is logged out

This test ensures all critical user flows work together seamlessly.

### Mocking Strategy

#### API Mocking
All API calls are mocked in test files:

```javascript
vi.mock('../services/api', () => ({
  register: vi.fn(() => Promise.resolve({ token: 'mock-token' })),
  login: vi.fn(() => Promise.resolve({ token: 'mock-token' })),
  logout: vi.fn(() => Promise.resolve()),
  getAllListings: vi.fn(() => Promise.resolve({ listings: [] })),
  createListing: vi.fn(() => Promise.resolve({ listingId: '123' })),
  getAllBookings: vi.fn(() => Promise.resolve({ bookings: [] })),
}));
```

#### Router Mocking
React Router navigation is mocked to test routing behavior:

```javascript
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});
```

## Running Tests

### Run all tests
```bash
npm run test
```

### Run tests in watch mode
```bash
npm run test -- --watch
```

### Run tests with coverage
```bash
npm run test -- --coverage
```

## Test Results

Current test status: **40/40 passing (100%)**

```
src/__test__/NavBar.test.jsx (8 tests)
src/__test__/Login.test.jsx (5 tests)
src/__test__/Register.test.jsx (6 tests)
src/__test__/HappyPath.test.jsx (1 test)
src/__test__/ListingCard.test.jsx (5 tests)
src/__test__/RatingBreakdown.test.jsx (7 tests)
src/__test__/StarRating.test.jsx (6 tests)
src/__test__/example.test.jsx (2 tests)

Test Files  8 passed (8)
Tests  40 passed (40)
```

## Best Practices

1. **Test User Behavior**: Tests focus on user interactions rather than implementation details
2. **Accessibility Queries**: Use accessible queries (`getByRole`, `getByLabelText`) when possible
3. **Async Handling**: Use `waitFor` for async operations to avoid race conditions
4. **Cleanup**: Each test uses `beforeEach` to reset mocks and localStorage
5. **Context Providers**: Components requiring context are wrapped appropriately in tests
6. **Data-testid**: Used for MUI icon buttons that lack accessible names

## Future Improvements

- Add snapshot testing for UI components
- Implement integration tests for complex user flows
- Add performance testing for data-heavy components
- Increase code coverage to 80%+
- Add visual regression testing
