import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '@/components/ui/loading';

describe('LoadingSpinner', () => {
  it('renders without crashing', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with correct styles', () => {
    const { container } = render(<LoadingSpinner />);
    const spinnerElement = container.querySelector('.animate-spin');
    expect(spinnerElement).toBeInTheDocument();
  });
}); 