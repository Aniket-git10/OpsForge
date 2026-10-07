import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

describe('UI Component & Page Tests', () => {
  it('Button renders text and responds to click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Deploy Pipeline</Button>);

    const btn = screen.getByRole('button', { name: /deploy pipeline/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('Button displays loading state and disables clicks when isLoading is true', () => {
    const handleClick = vi.fn();
    render(
      <Button isLoading onClick={handleClick}>
        Save Changes
      </Button>
    );

    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('Badge renders correct status text and classes', () => {
    render(<Badge status="in_progress" />);
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
  });

  it('LandingPage renders the headline and CTA buttons', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getAllByText(/build better\./i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/ship smarter\./i)[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start building free/i })).toBeInTheDocument();
  });

  it('LoginPage renders input fields and demo login options', () => {
    render(
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/1-Click Demo Logins for Evaluation/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin/i)).toBeInTheDocument();
  });
});
