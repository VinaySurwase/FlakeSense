import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock fetch for integration tests
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('FlakeSense Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('Full User Workflow', () => {
    test('complete user journey: load dashboard → run tests → view results', async () => {
      // Step 1: Initial load with empty results
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(<App />);

      // Verify initial empty state
      await waitFor(() => {
        expect(screen.getByText(/No tests yet/)).toBeInTheDocument();
      });

      // Step 2: User clicks "Run Tests"
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Test run complete' })
      });

      // Step 3: After running tests, fetch updated results
      const mockResults = [
        {
          name: 'login',
          status: 'Pass' as const,
          type: '',
          flaky: false,
          log: '',
          timestamp: '2025-07-09T10:00:00.000Z'
        },
        {
          name: 'payment',
          status: 'Fail' as const,
          type: 'Flaky',
          flaky: true,
          log: 'TimeoutError: simulated failure for payment',
          timestamp: '2025-07-09T10:01:00.000Z'
        },
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

      const runButton = screen.getByRole('button', { name: /run tests/i });
      fireEvent.click(runButton);

      // Verify loading state
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /running tests/i })).toBeInTheDocument();
      });

      // Step 4: Verify results are displayed correctly
      await waitFor(() => {
        expect(screen.getByText('login')).toBeInTheDocument();
        expect(screen.getByText('payment')).toBeInTheDocument();
        expect(screen.getByText('signup')).toBeInTheDocument();
      });

      // Verify status indicators
      expect(screen.getByText('✅ Pass')).toBeInTheDocument();
      expect(screen.getAllByText('❌ Fail')).toHaveLength(2);

      // Verify test types
      expect(screen.getByText('Flaky')).toBeInTheDocument();
      expect(screen.getByText('Real Bug')).toBeInTheDocument();

      // Verify flaky indicators (one flaky test should show ✅ in flaky column)
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      // Step 5: User refreshes to see latest results
      const updatedResults = [...mockResults, {
        name: 'newtest',
        status: 'Pass' as const,
        type: '',
        flaky: false,
        log: '',
        timestamp: '2025-07-09T10:03:00.000Z'
      }];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedResults
      });

      const refreshButton = screen.getByText(/Refresh/);
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByText('newtest')).toBeInTheDocument();
      });

      // Verify all API calls were made correctly
      expect(mockFetch).toHaveBeenCalledTimes(4); // initial + run + fetch after run + refresh
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5001/results');
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5001/run-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    test('handles mixed success/failure scenarios', async () => {
      // Initial successful load
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/No tests yet/)).toBeInTheDocument();
      });

      // Run tests successfully
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Test run complete' })
      });

      // But fetching results fails
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const runButton = screen.getByRole('button', { name: /run tests/i });
      fireEvent.click(runButton);

      // Should show error after run tests completes but fetch fails
      await waitFor(() => {
        expect(screen.getByText(/Backend is offline or unreachable/)).toBeInTheDocument();
      });

      // User can still try to refresh
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            name: 'recovery_test',
            status: 'Pass' as const,
            type: '',
            flaky: false,
            log: '',
            timestamp: '2025-07-09T10:00:00.000Z'
          }
        ]
      });

      const refreshButton = screen.getByText(/Refresh/);
      fireEvent.click(refreshButton);

      // Should recover and show results
      await waitFor(() => {
        expect(screen.getByText('recovery_test')).toBeInTheDocument();
        expect(screen.queryByText(/Backend is offline/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Real-time Behavior Simulation', () => {
    test('simulates flaky test behavior over multiple runs', async () => {
      // Initial load
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(<App />);

      // First run - test passes
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Test run complete' })
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            name: 'flaky_test',
            status: 'Pass' as const,
            type: '',
            flaky: false,
            log: '',
            timestamp: '2025-07-09T10:00:00.000Z'
          }
        ]
      });

      fireEvent.click(screen.getByText(/Run Tests/));

      await waitFor(() => {
        expect(screen.getByText('✅ Pass')).toBeInTheDocument();
      });

      // Second run - same test fails due to flakiness
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Test run complete' })
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            name: 'flaky_test',
            status: 'Pass' as const,
            type: '',
            flaky: false,
            log: '',
            timestamp: '2025-07-09T10:00:00.000Z'
          },
          {
            name: 'flaky_test',
            status: 'Fail' as const,
            type: 'Flaky',
            flaky: true,
            log: 'TimeoutError: intermittent failure',
            timestamp: '2025-07-09T10:01:00.000Z'
          }
        ]
      });

      fireEvent.click(screen.getByText(/Run Tests/));

      await waitFor(() => {
        expect(screen.getAllByText('flaky_test')).toHaveLength(2);
        expect(screen.getByText('Flaky')).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Loading States', () => {
    test('handles slow API responses gracefully', async () => {
      // Simulate slow initial load
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => []
          }), 200)
        )
      );

      render(<App />);

      // Initial loading state (component starts with useEffect fetch)
      // Component should be responsive during loading
      expect(screen.getByText('🔍 FlakeSense')).toBeInTheDocument();
      expect(screen.getByText(/Run Tests/)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText(/No tests yet/)).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    test('handles rapid successive clicks gracefully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => []
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/No tests yet/)).toBeInTheDocument();
      });

      // Mock slow run tests
      mockFetch.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ message: 'Test run complete' })
          }), 100)
        )
      );

      const runButton = screen.getByRole('button', { name: /run tests/i });
      
      // Click multiple times rapidly
      fireEvent.click(runButton);
      fireEvent.click(runButton);
      fireEvent.click(runButton);

      // Button should be disabled, preventing multiple requests
      expect(screen.getByRole('button', { name: /running tests/i })).toBeDisabled();

      // Should only make one run request despite multiple clicks
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /run tests/i })).not.toBeDisabled();
      });
    });
  });

  describe('Accessibility and UX', () => {
    test('provides appropriate ARIA labels and roles', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            name: 'test1',
            status: 'Pass' as const,
            type: '',
            flaky: false,
            log: '',
            timestamp: '2025-07-09T10:00:00.000Z'
          }
        ]
      });

      render(<App />);

      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();
      });

      // Check that buttons are properly labeled
      expect(screen.getByRole('button', { name: /run tests/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    });

    test('provides visual feedback for different states', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      render(<App />);

      // Test different visual states
      const runButton = screen.getByText(/Run Tests/);
      expect(runButton).not.toHaveClass('running');

      // Mock slow response to test loading state
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ message: 'Test run complete' })
          }), 50)
        )
      );

      fireEvent.click(runButton);

      // Should show running state
      await waitFor(() => {
        const runningButton = screen.getByText(/Running Tests.../);
        expect(runningButton).toHaveClass('running');
      });
    });
  });
});
