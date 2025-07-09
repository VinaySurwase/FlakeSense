import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

interface TestResult {
  name: string;
  status: 'Pass' | 'Fail';
  type: string;
  flaky: boolean;
  log: string;
  timestamp: string;
}

interface Stats {
  total: number;
  passed: number;
  failed: number;
  flaky: number;
  passRate: number;
}

function App() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pass' | 'fail' | 'flaky'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  // Calculate statistics
  const stats: Stats = React.useMemo(() => {
    const total = testResults.length;
    const passed = testResults.filter(r => r.status === 'Pass').length;
    const failed = testResults.filter(r => r.status === 'Fail').length;
    const flaky = testResults.filter(r => r.flaky).length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    
    return { total, passed, failed, flaky, passRate };
  }, [testResults]);

  // Filter and search results
  const filteredResults = React.useMemo(() => {
    let filtered = testResults;
    
    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(result => {
        switch (filter) {
          case 'pass': return result.status === 'Pass';
          case 'fail': return result.status === 'Fail';
          case 'flaky': return result.flaky;
          default: return true;
        }
      });
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(result => 
        result.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.log.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [testResults, filter, searchTerm]);

  // Fetch test results
  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/results`);
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      const data = await response.json();
      setTestResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Backend is offline or unreachable');
      console.error('Error fetching results:', err);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

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

  // Clear all results
  const clearResults = () => {
    setTestResults([]);
    setError(null);
  };

  // Auto refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchResults, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchResults]);

  // Fetch results on component mount
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>🔍 FlakeSense</h1>
          <p>Smart QA Platform for Test Analysis</p>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Tests</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.passRate}%</span>
              <span className="stat-label">Pass Rate</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.flaky}</span>
              <span className="stat-label">Flaky Tests</span>
            </div>
          </div>
        </div>
      </header>

      <main className="App-main">
        <div className="controls-section">
          <div className="action-controls">
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
            <button
              className="clear-button"
              onClick={clearResults}
              disabled={isLoading || isRunning}
            >
              🗑️ Clear
            </button>
          </div>

          <div className="filter-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search tests, types, or logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-buttons">
              <button
                className={`filter-button ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({stats.total})
              </button>
              <button
                className={`filter-button pass ${filter === 'pass' ? 'active' : ''}`}
                onClick={() => setFilter('pass')}
              >
                Passed ({stats.passed})
              </button>
              <button
                className={`filter-button fail ${filter === 'fail' ? 'active' : ''}`}
                onClick={() => setFilter('fail')}
              >
                Failed ({stats.failed})
              </button>
              <button
                className={`filter-button flaky ${filter === 'flaky' ? 'active' : ''}`}
                onClick={() => setFilter('flaky')}
              >
                Flaky ({stats.flaky})
              </button>
            </div>

            <div className="auto-refresh">
              <label className="auto-refresh-label">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                Auto-refresh (10s)
              </label>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
            <button className="error-dismiss" onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="results-section">
          <div className="results-header">
            <h2>Test Results</h2>
            <div className="results-info">
              {filteredResults.length !== testResults.length && (
                <span className="filter-info">
                  Showing {filteredResults.length} of {testResults.length} tests
                </span>
              )}
              {testResults.length > 0 && (
                <span className="last-updated">
                  Last updated: {new Date().toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <span>Loading test results...</span>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="no-results">
              {testResults.length === 0 ? (
                <>
                  <div className="no-results-icon">📋</div>
                  <h3>No tests yet</h3>
                  <p>Click "Run Tests" to start your first test execution!</p>
                </>
              ) : (
                <>
                  <div className="no-results-icon">🔍</div>
                  <h3>No matching tests found</h3>
                  <p>Try adjusting your search criteria or filters.</p>
                </>
              )}
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
                  {filteredResults.map((result, index) => (
                    <tr key={`${result.name}-${result.timestamp}-${index}`} 
                        className={`result-row ${result.status.toLowerCase()}`}>
                      <td className="test-name">
                        <span className="test-name-text">{result.name}</span>
                      </td>
                      <td className={`status ${result.status.toLowerCase()}`}>
                        <span className="status-badge">
                          {result.status === 'Pass' ? '✅' : '❌'} {result.status}
                        </span>
                      </td>
                      <td className={`type ${result.type.toLowerCase().replace(' ', '-')}`}>
                        {result.type ? (
                          <span className="type-badge">{result.type}</span>
                        ) : (
                          <span className="type-empty">-</span>
                        )}
                      </td>
                      <td className="flaky">
                        <span className={`flaky-indicator ${result.flaky ? 'is-flaky' : 'not-flaky'}`}>
                          {result.flaky ? '✅' : '❌'}
                        </span>
                      </td>
                      <td className="log">
                        {result.log ? (
                          <details className="log-details">
                            <summary className="log-summary">
                              {result.log.slice(0, 50)}{result.log.length > 50 ? '...' : ''}
                            </summary>
                            <pre className="log-content">{result.log}</pre>
                          </details>
                        ) : (
                          <span className="log-empty">-</span>
                        )}
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

        <footer className="app-footer">
          <p>FlakeSense v1.0 | Built for Smart QA Testing</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
