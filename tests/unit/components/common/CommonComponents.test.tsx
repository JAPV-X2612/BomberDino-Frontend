import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Button } from '@/components/common/Button/Button';
import { Input } from '@/components/common/Input/Input';
import { Toast } from '@/components/common/Toast/Toast';

describe('UI common components', () => {
  it('Button renders content, applies variant and handles click', () => {
    const handleClick = vi.fn();

    render(
      <Button variant="secondary" onClick={handleClick}>
        Click me
      </Button>,
    );

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('btn-secondary');

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('Input notifies value changes', () => {
    const handleChange = vi.fn();

    render(<Input value="initial" onChange={handleChange} placeholder="Type here" />);

    const input = screen.getByPlaceholderText(/type here/i);
    fireEvent.change(input, { target: { value: 'updated' } });

    expect(handleChange).toHaveBeenCalledWith('updated');
  });

  it('Toast displays message and auto-closes after duration', () => {
    vi.useFakeTimers();
    const handleClose = vi.fn();

    render(<Toast message="Test error" type="error" onClose={handleClose} duration={1000} />);

    expect(screen.getByText('Test error')).toBeInTheDocument();

    vi.advanceTimersByTime(1000);
    expect(handleClose).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});
