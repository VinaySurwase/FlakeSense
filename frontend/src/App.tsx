import React, { useState, useEffect } from 'react';
import './App.css';

interface TestResult {
  name: string;
  status: 'Pass' | 'Fail';
  type: string;
  flaky: boolean;
  log: string;
  timestamp: string;
}

function App() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  // Fetch test results
  const fetchResults = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/results`);
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      const data = await response.json();
      setTestResults(data);
    } catch (err) {
      setError('Backend is offline or unreachable');
      console.error('Error fetching results:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Run tests
  const runTests = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/run-tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to run tests');
      }
      // Automatically fetch results after test run
      await fetchResults();
    } catch (err) {
      setError('Backend is offline or unreachable');
      console.error('Error running tests:', err);
    } finally {
      setIsRunning(false);
    }
  };

  // Fetch results on component mount
  useEffect(() => {
    fetchResults();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔍 FlakeSense</h1>
        <p>Smart QA Platform for Test Analysis</p>
      </header>

      <main className="App-main">
        <div className="controls">
          <button
            className={`run-button ${isRunning ? 'running' : ''}`}
            onClick={runTests}
            disabled={isRunning}
          >
            {isRunning ? '🔄 Running Tests...' : '▶️ Run Tests'}
          </button>
          <button
            className="refresh-button"
            onClick={fetchResults}
            disabled={isLoading}
          >
            {isLoading ? '🔄 Loading...' : '🔄 Refresh'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <div className="results-section">
          <h2>Test Results</h2>
          
          {isLoading ? (
            <div className="loading">Loading test results...</div>
          ) : testResults.length === 0 ? (
            <div className="no-results">
              📋 No tests yet. Click "Run Tests" to start!
            </div>
          ) : (
            <div className="results-table-container">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Test Name</th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Flaky?</th>
                    <th>Log</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((result, index) => (
                    <tr key={index} className={`result-row ${result.status.toLowerCase()}`}>
                      <td className="test-name">{result.name}</td>
                      <td className={`status ${result.status.toLowerCase()}`}>
                        {result.status === 'Pass' ? '✅' : '❌'} {result.status}
                      </td>
                      <td className={`type ${result.type.toLowerCase().replace(' ', '-')}`}>
                        {result.type || '-'}
                      </td>
                      <td className="flaky">
                        {result.flaky ? '✅' : '❌'}
                      </td>
                      <td className="log">
                        {result.log || '-'}
                      </td>
                      <td className="timestamp">
                        {new Date(result.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
