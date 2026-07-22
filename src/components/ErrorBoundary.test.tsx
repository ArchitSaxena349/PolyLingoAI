import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorBoundary from './ErrorBoundary';

const FaultyComponent: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test component crashed');
  }
  return <div>Component working correctly</div>;
};

describe('ErrorBoundary Component', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <FaultyComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Component working correctly')).toBeInTheDocument();
  });

  it('catches render errors and displays fallback UI', () => {
    // Suppress console.error in vitest during intentional error boundary testing
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary title="Test Error Title">
        <FaultyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Test Error Title')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('allows expanding technical details on demand', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <FaultyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const toggleButton = screen.getByText('Technical details');
    expect(toggleButton).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.getByText(/Test component crashed/i)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
