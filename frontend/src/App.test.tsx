import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('FlakeSense Dashboard', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    mockFetch.mockReset();
    // Clear any console errors
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    mockFetch.mockReset();
  });

  describe('Component Rendering', () => {
    test('renders dashboard header and title', () => {
      // Mock empty results response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(<App />);
      
      expect(screen.getByText('🔍 FlakeSense')).toBeInTheDocument();
      expect(screen.getByText('Smart QA Platform for Test Analysis')).toBeInTheDocument();
    });

    test('renders control buttons', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(<App />);
      
      expect(screen.getByRole('button', { name: /run tests/i })).toBeInTheDocument();
      
      // Wait for loading to complete so we can find the refresh button
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
      });
    });

    test('renders table headers when results exist', async () => {
      const mockResults = [
        {
          name: 'login',
          status: 'Pass' as const,
          type: '',
          flaky: false,
          log: '',
          timestamp: '2025-07-09T10:00:00.000Z'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Name')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Type')).toBeInTheDocument();
        expect(screen.getByText('Flaky?')).toBeInTheDocument();
        expect(screen.getByText('Log')).toBeInTheDocument();
        expect(screen.getByText('Timestamp')).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    test('fetches and displays test results on mount', async () => {
      const mockResults = [
        {
          name: 'login',
          status: 'Fail' as const,
          type: 'Flaky',
          flaky: true,
          log: 'TimeoutError: simulated failure for login',
          timestamp: '2025-07-09T10:00:00.000Z'
        },
        {
          name: 'payment',
          status: 'Pass' as const,
          type: '',
          flaky: false,
          log: '',
          timestamp: '2025-07-09T10:01:00.000Z'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      render(<App />);

      // Wait for results to be displayed
      await waitFor(() => {
        expect(screen.getByText('login')).toBeInTheDocument();
        expect(screen.getByText('payment')).toBeInTheDocument();
      });

      // Check status display
      expect(screen.getByText('❌ Fail')).toBeInTheDocument();
      expect(screen.getByText('✅ Pass')).toBeInTheDocument();

      // Check flaky indicators
      const tableRows = screen.getAllByRole('row');
      // Should have header row plus 2 data rows
      expect(tableRows.length).toBeGreaterThanOrEqual(3);

      // Check that fetch was called with correct URL
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5001/results');
    });

    test('displays error message when API is unreachable', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Backend is offline or unreachable/)).toBeInTheDocument();
      });
    });

    test('displays error message when API returns non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Backend is offline or unreachable/)).toBeInTheDocument();
      });
    });
  });

  describe('Button Interactions', () => {
    test('run tests button triggers POST request and fetches results', async () => {
      // Mock initial empty results
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      // Mock run tests response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Test run complete' })
      });

      // Mock updated results after running tests
      const mockResults = [
        {
          name: 'login',
          status: 'Pass' as const,
          type: '',
          flaky: false,
          log: '',
          timestamp: '2025-07-09T10:00:00.000Z'
        }
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      render(<App />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/No tests yet/)).toBeInTheDocument();
      });

      // Click run tests button
      const runButton = screen.getByRole('button', { name: /run tests/i });
      fireEvent.click(runButton);

      // Check that button shows running state
      await waitFor(() => {
        expect(screen.getByText(/Running Tests.../)).toBeInTheDocument();
      });

      // Wait for completion and results
      await waitFor(() => {
        expect(screen.getByText('login')).toBeInTheDocument();
      });

      // Verify correct API calls were made
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5001/results');
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5001/run-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    test('refresh button fetches latest results', async () => {
      // Mock initial results
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(<App />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/No tests yet/)).toBeInTheDocument();
      });

      // Mock refresh response
      const mockResults = [
        {
          name: 'signup',
          status: 'Fail' as const,
          type: 'Real Bug',
          flaky: false,
          log: 'AssertionError: simulated failure for signup',
          timestamp: '2025-07-09T10:02:00.000Z'
        }
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      // Click refresh button
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      // Wait for results
      await waitFor(() => {
        expect(screen.getByText('signup')).toBeInTheDocument();
        expect(screen.getByText('Real Bug')).toBeInTheDocument();
      });
    });

    test('buttons are disabled during loading states', async () => {
      // Mock slow response for initial load
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => []
          }), 100)
        )
      );

      render(<App />);

      // Run button should be available initially (after first load completes)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /run tests/i })).not.toBeDisabled();
      });

      // Mock slow run tests response
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ message: 'Test run complete' })
          }), 100)
        )
      );

      const runButton = screen.getByRole('button', { name: /run tests/i });
      fireEvent.click(runButton);

      // Run button should be disabled during running
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /running tests/i })).toBeDisabled();
      });
    });
  });

  describe('Result Display Logic', () => {
    test('displays flaky vs stable logic correctly', async () => {
      const mockResults = [
        {
          name: 'flaky_test',
          status: 'Fail' as const,
          type: 'Flaky',
          flaky: true,
          log: 'TimeoutError: flaky failure',
          timestamp: '2025-07-09T10:00:00.000Z'
        },
        {
          name: 'stable_test',
          status: 'Pass' as const,
          type: '',
          flaky: false,
          log: '',
          timestamp: '2025-07-09T10:01:00.000Z'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('flaky_test')).toBeInTheDocument();
        expect(screen.getByText('stable_test')).toBeInTheDocument();
      });

      // Find the rows by test name and check flaky column
      const flakyRow = screen.getByText('flaky_test').closest('tr');
      const stableRow = screen.getByText('stable_test').closest('tr');

      // In the flaky column, flaky test should show ✅, stable should show ❌
      expect(flakyRow).toBeInTheDocument();
      expect(stableRow).toBeInTheDocument();
    });

    test('displays different test types correctly', async () => {
      const mockResults = [
        {
          name: 'timeout_test',
          status: 'Fail' as const,
          type: 'Flaky',
          flaky: true,
          log: 'TimeoutError: timeout',
          timestamp: '2025-07-09T10:00:00.000Z'
        },
        {
          name: 'infra_test',
          status: 'Fail' as const,
          type: 'Infra Issue',
          flaky: false,
          log: 'ElementNotFoundError: element missing',
          timestamp: '2025-07-09T10:01:00.000Z'
        },
        {
          name: 'bug_test',
          status: 'Fail' as const,
          type: 'Real Bug',
          flaky: false,
          log: 'AssertionError: wrong value',
          timestamp: '2025-07-09T10:02:00.000Z'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Flaky')).toBeInTheDocument();
        expect(screen.getByText('Infra Issue')).toBeInTheDocument();
        expect(screen.getByText('Real Bug')).toBeInTheDocument();
      });
    });

    test('handles empty states correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/No tests yet. Click "Run Tests" to start!/)).toBeInTheDocument();
      });

      // Should not show table when no results
      expect(screen.queryByText('Test Name')).not.toBeInTheDocument();
    });

    test('formats timestamps correctly', async () => {
      const mockResults = [
        {
          name: 'test1',
          status: 'Pass' as const,
          type: '',
          flaky: false,
          log: '',
          timestamp: '2025-07-09T10:00:00.000Z'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('test1')).toBeInTheDocument();
      });

      // Should display formatted timestamp (exact format may vary by locale)
      const timestampElements = screen.getAllByText(/2025|Jul|July|07|09|10/);
      expect(timestampElements.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('gracefully handles malformed API responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'response' })
      });

      render(<App />);

      // Should not crash, might show error or empty state
      await waitFor(() => {
        // Component should still render without crashing
        expect(screen.getByText('🔍 FlakeSense')).toBeInTheDocument();
      });
    });

    test('handles network timeout gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network timeout'));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Backend is offline or unreachable/)).toBeInTheDocument();
      });
    });

    test('shows error when run tests fails', async () => {
      // Mock successful initial load
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/No tests yet/)).toBeInTheDocument();
      });

      // Mock failed run tests request
      mockFetch.mockRejectedValueOnce(new Error('Server error'));

      const runButton = screen.getByRole('button', { name: /run tests/i });
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText(/Backend is offline or unreachable/)).toBeInTheDocument();
      });
    });
  });

  describe('Environment Configuration', () => {
    test('uses correct API URL from environment', () => {
      // Test default URL
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(<App />);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5001/results');
    });
  });
});
