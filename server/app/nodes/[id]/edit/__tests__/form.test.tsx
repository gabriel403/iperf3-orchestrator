import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditNodeForm } from '../form';

const mockNode = {
  id: 'test-node-id',
  name: 'Test Node',
  description: 'Test Description',
  secretKey: 'existing-api-key-123',
  pollIntervalSeconds: 300,
};

const mockUpdateNode = jest.fn();
const mockDeleteNode = jest.fn();

describe('EditNodeForm', () => {
  beforeEach(() => {
    mockUpdateNode.mockClear();
    mockDeleteNode.mockClear();
  });

  it('renders all form fields with existing node data', () => {
    render(<EditNodeForm node={mockNode} updateNode={mockUpdateNode} deleteNode={mockDeleteNode} />);

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
    const apiKeyInput = screen.getByLabelText(/api key/i) as HTMLInputElement;
    const pollIntervalInput = screen.getByLabelText(/poll interval/i) as HTMLInputElement;

    expect(nameInput.value).toBe('Test Node');
    expect(descriptionInput.value).toBe('Test Description');
    expect(apiKeyInput.value).toBe('existing-api-key-123');
    expect(pollIntervalInput.value).toBe('300');
  });

  it('renders Generate button for API key', () => {
    render(<EditNodeForm node={mockNode} updateNode={mockUpdateNode} deleteNode={mockDeleteNode} />);

    const generateButton = screen.getByRole('button', { name: /generate/i });
    expect(generateButton).toBeInTheDocument();
  });

  it('generates new API key when Generate button is clicked', async () => {
    const user = userEvent.setup();
    render(<EditNodeForm node={mockNode} updateNode={mockUpdateNode} deleteNode={mockDeleteNode} />);

    const apiKeyInput = screen.getByLabelText(/api key/i) as HTMLInputElement;
    const generateButton = screen.getByRole('button', { name: /generate/i });

    // Initially has existing key
    expect(apiKeyInput.value).toBe('existing-api-key-123');

    // Click generate
    await user.click(generateButton);

    // Should have generated a new 32-character hex string
    expect(apiKeyInput.value).toMatch(/^[0-9a-f]{32}$/);
    expect(apiKeyInput.value).not.toBe('existing-api-key-123');
  });

  it('renders Save changes and Delete node buttons', () => {
    render(<EditNodeForm node={mockNode} updateNode={mockUpdateNode} deleteNode={mockDeleteNode} />);

    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete node/i })).toBeInTheDocument();
  });

  it('requires name and API key fields', () => {
    render(<EditNodeForm node={mockNode} updateNode={mockUpdateNode} deleteNode={mockDeleteNode} />);

    const nameInput = screen.getByLabelText(/name/i);
    const apiKeyInput = screen.getByLabelText(/api key/i);

    expect(nameInput).toBeRequired();
    expect(apiKeyInput).toBeRequired();
  });

  it('shows confirmation dialog when Delete button is clicked', async () => {
    const user = userEvent.setup();
    // Mock window.confirm
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    render(<EditNodeForm node={mockNode} updateNode={mockUpdateNode} deleteNode={mockDeleteNode} />);

    const deleteButton = screen.getByRole('button', { name: /delete node/i });
    await user.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalledWith(
      expect.stringContaining('Are you sure you want to delete')
    );
    expect(confirmSpy).toHaveBeenCalledWith(
      expect.stringContaining('Test Node')
    );

    confirmSpy.mockRestore();
  });

  it('calls deleteNode when Delete is confirmed', async () => {
    const user = userEvent.setup();
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    mockDeleteNode.mockResolvedValueOnce(undefined);

    render(<EditNodeForm node={mockNode} updateNode={mockUpdateNode} deleteNode={mockDeleteNode} />);

    const deleteButton = screen.getByRole('button', { name: /delete node/i });
    await user.click(deleteButton);

    expect(mockDeleteNode).toHaveBeenCalled();
  });

  it('does not call deleteNode when Delete is cancelled', async () => {
    const user = userEvent.setup();
    jest.spyOn(window, 'confirm').mockReturnValue(false);

    render(<EditNodeForm node={mockNode} updateNode={mockUpdateNode} deleteNode={mockDeleteNode} />);

    const deleteButton = screen.getByRole('button', { name: /delete node/i });
    await user.click(deleteButton);

    expect(mockDeleteNode).not.toHaveBeenCalled();
  });
});
