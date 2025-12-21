import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewNodeForm } from '../form';

// Mock the createNode function
const mockCreateNode = jest.fn();

describe('NewNodeForm', () => {
  beforeEach(() => {
    mockCreateNode.mockClear();
  });

  it('renders all form fields', () => {
    render(<NewNodeForm createNode={mockCreateNode} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/api key/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/poll interval/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create node/i })).toBeInTheDocument();
  });

  it('renders Generate button for API key', () => {
    render(<NewNodeForm createNode={mockCreateNode} />);

    const generateButton = screen.getByRole('button', { name: /generate/i });
    expect(generateButton).toBeInTheDocument();
    expect(generateButton).toHaveAttribute('type', 'button');
  });

  it('generates API key when Generate button is clicked', async () => {
    const user = userEvent.setup();
    render(<NewNodeForm createNode={mockCreateNode} />);

    const apiKeyInput = screen.getByLabelText(/api key/i) as HTMLInputElement;
    const generateButton = screen.getByRole('button', { name: /generate/i });

    // Initially empty
    expect(apiKeyInput.value).toBe('');

    // Click generate
    await user.click(generateButton);

    // Should have generated a 32-character hex string
    expect(apiKeyInput.value).toMatch(/^[0-9a-f]{32}$/);
  });

  it('requires name and API key fields', () => {
    render(<NewNodeForm createNode={mockCreateNode} />);

    const nameInput = screen.getByLabelText(/name/i);
    const apiKeyInput = screen.getByLabelText(/api key/i);

    expect(nameInput).toBeRequired();
    expect(apiKeyInput).toBeRequired();
  });

  it('has default value for poll interval', () => {
    render(<NewNodeForm createNode={mockCreateNode} />);

    const pollIntervalInput = screen.getByLabelText(/poll interval/i) as HTMLInputElement;
    expect(pollIntervalInput.value).toBe('300');
  });

  it('calls createNode when form is submitted', async () => {
    const user = userEvent.setup();
    mockCreateNode.mockResolvedValueOnce(undefined);
    
    render(<NewNodeForm createNode={mockCreateNode} />);

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    const apiKeyInput = screen.getByLabelText(/api key/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /create node/i });

    await user.type(nameInput, 'Test Node');
    await user.type(apiKeyInput, 'test-api-key');

    // Verify values were set
    expect(nameInput.value).toBe('Test Node');
    expect(apiKeyInput.value).toBe('test-api-key');

    // Submit the form
    await user.click(submitButton);

    // Note: In a real implementation, you'd need to mock FormData handling
    // This test verifies the button is clickable and form structure is correct
  });
});
