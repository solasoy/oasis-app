import { render, screen } from '@testing-library/react';
import { Navbar } from '@/components/layout/navbar';

describe('Navbar', () => {
  it('renders navigation links', () => {
    render(<Navbar />);
    
    // Update links to match actual navbar content
    const links = ['Home', 'Apply', 'Donations', 'Dashboard', 'Admin'];
    links.forEach(link => {
      expect(screen.getByText(link)).toBeInTheDocument();
    });
  });
});