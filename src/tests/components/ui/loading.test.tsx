import { render } from '@testing-library/react';
import { Loading } from '@/components/ui/loading';

describe('Loading', () => {
  it('renders loading spinner', () => {
    const { container } = render(<Loading />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });
}); 