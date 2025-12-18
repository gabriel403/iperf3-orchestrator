# Testing Guide

This project uses Jest and React Testing Library for unit and component testing.

## Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage
```

## Test Structure

- **Unit Tests**: Located in `__tests__` directories next to the code they test
  - `lib/__tests__/` - Utility function tests
  - `app/api/__tests__/` - API route tests

- **Component Tests**: Located in component directories
  - `app/nodes/new/__tests__/` - Form component tests
  - `app/nodes/[id]/edit/__tests__/` - Edit form tests

## Writing Tests

### Unit Test Example

```typescript
import { getApiKeyFromRequest } from '../auth';

describe('getApiKeyFromRequest', () => {
  it('should extract API key from Authorization header', () => {
    const request = new Request('http://example.com', {
      headers: { 'Authorization': 'Bearer test-key' },
    });
    expect(getApiKeyFromRequest(request)).toBe('test-key');
  });
});
```

### Component Test Example

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '../component';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    await user.click(screen.getByRole('button'));
    // Assert expected behavior
  });
});
```

## Test Configuration

- **Jest Config**: `jest.config.js` - Uses Next.js Jest preset
- **Setup File**: `jest.setup.js` - Configures testing-library/jest-dom
- **TypeScript**: Tests use the same TypeScript config as the app

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component/function does, not how
2. **Use Accessible Queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Mock External Dependencies**: Mock Prisma, API calls, and other external services
4. **Keep Tests Isolated**: Each test should be independent and not rely on other tests
5. **Test Edge Cases**: Include tests for error conditions and boundary cases

## Coverage

Aim for:
- **80%+ line coverage** for critical paths
- **100% coverage** for utility functions
- **Component coverage** for user-facing interactions

View coverage reports after running `yarn test:coverage` in the `coverage/` directory.
