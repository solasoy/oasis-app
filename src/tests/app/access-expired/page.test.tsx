import React from 'react';
import { render, screen } from '@testing-library/react';
import AccessExpiredPage from '@/app/access-expired/page';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="link">
      {children}
    </a>
  );
});

describe('AccessExpiredPage', () => {
  it('renders the access expired message', () => {
    render(<AccessExpiredPage />);
    
    // Check that the page title is rendered
    expect(screen.getByText('Access Expired')).toBeInTheDocument();
    
    // Check that the explanation message is rendered
    expect(
      screen.getByText('Your access to the Oasis Retreat participant dashboard has expired.')
    ).toBeInTheDocument();
    
    // Check that the thank you message is rendered
    expect(
      screen.getByText(/Thank you for participating in the Oasis Retreat/)
    ).toBeInTheDocument();
    
    // Check that the contact message is rendered
    expect(
      screen.getByText(/If you believe this is an error or have any questions/)
    ).toBeInTheDocument();
  });
  
  it('renders a link to the home page', () => {
    render(<AccessExpiredPage />);
    
    // Check that the link to the home page is rendered
    const link = screen.getByTestId('link');
    expect(link).toHaveAttribute('href', '/');
    expect(link).toHaveTextContent('Return to Home');
  });
});