# FlakeSense Testing Suite

This document describes the comprehensive testing setup for FlakeSense, covering both backend (Flask/Python) and frontend (React/TypeScript) testing.

## 🧪 Test Coverage Overview

### Backend Tests (Python/Flask)

- **API Endpoint Testing**: Full coverage of `/run-tests` and `/results` endpoints
- **Classification Logic Testing**: Validates error type classification (Flaky, Real Bug, Infra Issue)
- **Integration Testing**: End-to-end API workflow testing
- **Error Handling**: Network errors, malformed responses, edge cases

### Frontend Tests (React/TypeScript)

- **Component Rendering**: UI component display and structure
- **API Integration**: Fetch operations and data display
- **User Interactions**: Button clicks, loading states, error handling
- **Accessibility**: ARIA labels, keyboard navigation
- **Performance**: Loading states, rapid interactions

## 📁 Test File Structure

```
FlakeSense/
├── backend/
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_api.py              # API endpoint tests
│   │   └── test_classification.py   # Error classification tests
│   ├── pytest.ini                   # Pytest configuration
│   └── run_tests.sh                 # Backend test runner
├── frontend/
│   ├── src/
│   │   ├── __tests__/
│   │   │   ├── App.integration.test.tsx  # Integration tests
│   │   │   └── testUtils.ts              # Test utilities
│   │   └── App.test.tsx             # Main component tests
│   └── run_tests.sh                 # Frontend test runner
└── run_all_tests.sh                 # Complete test suite runner
```

## 🚀 Running Tests

### Quick Start - Run All Tests

```bash
# From project root
./run_all_tests.sh
```

### Backend Tests Only

```bash
cd backend
./run_tests.sh

# Or manually:
pip install -r requirements.txt
python -m pytest --cov=app --cov-report=html
python -m unittest discover tests/ -v
```

### Frontend Tests Only

```bash
cd frontend
./run_tests.sh

# Or manually:
npm install
npm test
npm run test:coverage
```

## 📊 Test Categories

### 1. Backend API Tests (`test_api.py`)

#### Endpoint Testing

- ✅ `test_run_tests_endpoint_returns_200`: Verifies HTTP 200 response
- ✅ `test_run_tests_endpoint_adds_entries`: Confirms test entries are added
- ✅ `test_run_tests_entry_structure`: Validates response structure
- ✅ `test_results_endpoint_returns_all_results`: Tests result retrieval
- ✅ `test_results_endpoint_structure`: Validates result format

#### Error Handling

- ✅ `test_invalid_http_methods`: Tests 405 responses for wrong methods
- ✅ `test_nonexistent_endpoint`: Tests 404 for invalid routes

### 2. Backend Classification Tests (`test_classification.py`)

#### Error Type Classification

- ✅ `test_timeout_error_classified_as_flaky`: TimeoutError → Flaky
- ✅ `test_element_not_found_classified_as_infra_issue`: ElementNotFoundError → Infra Issue
- ✅ `test_assertion_error_classified_as_real_bug`: AssertionError → Real Bug
- ✅ `test_unknown_error_classified_as_unknown`: Unknown errors → Unknown
- ✅ `test_passing_tests_have_empty_classification`: Pass tests have empty fields

#### Edge Cases

- ✅ `test_mixed_error_types`: Multiple error types in single run
- ✅ `test_case_sensitivity_in_classification`: Case sensitivity handling
- ✅ `test_partial_string_matching`: Substring matching logic

### 3. Frontend Component Tests (`App.test.tsx`)

#### Component Rendering

- ✅ Header and title display
- ✅ Control buttons presence
- ✅ Table structure with results
- ✅ Empty state messaging

#### API Integration

- ✅ Fetch results on component mount
- ✅ Display fetched results correctly
- ✅ Handle API errors gracefully
- ✅ Show appropriate error messages

#### User Interactions

- ✅ Run tests button functionality
- ✅ Refresh button behavior
- ✅ Button state management (loading/disabled)
- ✅ Visual feedback for different states

### 4. Frontend Integration Tests (`App.integration.test.tsx`)

#### Full User Workflows

- ✅ Complete journey: load → run tests → view results
- ✅ Mixed success/failure scenarios
- ✅ Recovery from errors

#### Real-time Behavior

- ✅ Flaky test simulation over multiple runs
- ✅ Result accumulation testing

#### Performance & UX

- ✅ Slow API response handling
- ✅ Rapid successive clicks
- ✅ Accessibility compliance

## 🎯 Test Data & Mocking

### Backend Mocking

```python
@patch('app.random.random')
@patch('app.random.choice')
def test_timeout_error_classified_as_flaky(self, mock_choice, mock_random):
    mock_random.return_value = 0.2  # Force failure
    mock_choice.return_value = "TimeoutError"
    # Test implementation...
```

### Frontend Mocking

```typescript
const mockFetch = jest.fn();
global.fetch = mockFetch;

mockFetch.mockResolvedValueOnce({
  ok: true,
  json: async () => mockResults,
});
```

### Test Utilities

The `testUtils.ts` file provides:

- Mock data factories
- Common test scenarios
- Response builders
- Random data generators

## 📈 Coverage Requirements

### Backend Coverage (pytest-cov)

- **Target**: 80% minimum coverage
- **Reports**: HTML report in `htmlcov/`, terminal summary
- **Configuration**: `pytest.ini`

### Frontend Coverage (Jest)

- **Target**: 80% minimum coverage (branches, functions, lines, statements)
- **Reports**: HTML report in `coverage/lcov-report/`, terminal summary
- **Configuration**: `package.json` jest section

## 🔧 Configuration Files

### Backend (`pytest.ini`)

```ini
[tool:pytest]
testpaths = tests
addopts = --verbose --cov=app --cov-report=html --cov-fail-under=80
```

### Frontend (`package.json`)

```json
{
  "jest": {
    "collectCoverageFrom": ["src/**/*.{js,jsx,ts,tsx}"],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

## 🚨 Troubleshooting

### Common Issues

#### Backend Tests

```bash
# Virtual environment issues
source .venv/bin/activate
pip install -r requirements.txt

# Import path issues
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Pytest not found
pip install pytest pytest-cov
```

#### Frontend Tests

```bash
# Node modules issues
rm -rf node_modules package-lock.json
npm install

# Jest configuration issues
npm test -- --init

# TypeScript issues
npm install --save-dev @types/jest @testing-library/jest-dom
```

### Debug Mode

```bash
# Backend verbose testing
python -m pytest -v -s

# Frontend debug mode
npm test -- --verbose --no-cache
```

## 🎉 Extra Features

### SDET-Oriented Enhancements

1. **Flaky Test Detection**: Simulates and identifies flaky tests
2. **Coverage Reports**: Generates detailed HTML coverage reports
3. **Mock Test Suites**: Comprehensive mocking for deterministic tests
4. **Property-Based Testing**: Random test data generation
5. **Performance Testing**: Load state and rapid interaction testing
6. **Accessibility Testing**: ARIA compliance and keyboard navigation
7. **Integration Testing**: End-to-end workflow validation

### Continuous Integration Ready

- ✅ `npm run test:ci` for CI/CD pipelines
- ✅ Coverage reporting with exit codes
- ✅ Parallel test execution support
- ✅ Environment-specific configurations

## 📚 Best Practices

1. **Test Isolation**: Each test clears state before/after execution
2. **Deterministic Testing**: Mock random functions for predictable results
3. **Error Simulation**: Test both happy path and error scenarios
4. **Real-world Scenarios**: Include timeout, network errors, malformed data
5. **User-Centric Testing**: Test actual user workflows and interactions
6. **Performance Considerations**: Test loading states and rapid interactions
7. **Accessibility**: Ensure tests verify ARIA labels and keyboard navigation

---

**Happy Testing!** 🧪✨

For questions or issues, refer to the test output or check the generated coverage reports.
