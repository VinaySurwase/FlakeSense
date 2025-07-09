# FlakeSense - Smart QA Platform

## Overview / Introduction

FlakeSense is an intelligent testing platform designed to identify and classify flaky tests in software applications. The project addresses one of the most challenging problems in modern software testing - detecting and managing test instability that leads to false positives and negatives in CI/CD pipelines.

**Key Features:**

- **Flaky Test Detection**: Automatically identifies unstable tests that fail intermittently
- **Intelligent Classification**: Categorizes test failures into different types (Flaky, Infrastructure Issues, Real Bugs)
- **Real-time Dashboard**: Provides a clean, intuitive interface to monitor test results
- **Comprehensive Test Coverage**: Includes both backend API testing and frontend integration testing

## Tech Stack Used

### Backend

- **Python** - Core backend development
- **Flask** - Web framework for REST API
- **Flask-CORS** - Cross-origin resource sharing support

### Frontend

- **TypeScript** - Type-safe JavaScript development
- **React** - Component-based UI framework
- **React DOM** - React rendering library

### Testing Frameworks

- **PyTest** - Python testing framework with coverage support
- **Jest** - JavaScript testing framework
- **React Testing Library** - React component testing utilities
- **unittest** - Python's built-in testing framework (fallback)

### Development Tools

- **pytest-cov** - Test coverage reporting
- **ESLint** - Code linting and formatting
- **TypeScript Compiler** - Type checking and compilation

## Installation Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Clone the Repository

```bash
git clone https://github.com/yourusername/flakesense.git
cd flakesense
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

## How to Run the Tests

### Run All Tests (Recommended)

```bash
# From project root directory
chmod +x run_all_tests.sh
./run_all_tests.sh
```

### Backend Tests Only

```bash
# Navigate to backend directory
cd backend

# Run the backend test suite
chmod +x run_tests.sh
./run_tests.sh
```

### Frontend Tests Only

```bash
# Navigate to frontend directory
cd frontend

# Run the frontend test suite
chmod +x run_tests.sh
./run_tests.sh
```

### Individual Test Commands

**Backend Testing:**

```bash
# Run with pytest (with coverage)
python -m pytest --cov=. --cov-report=html

# Run specific test files
python -m pytest tests/test_api.py -v
python -m pytest tests/test_classification.py -v

# Run with unittest (fallback)
python -m unittest discover tests/ -v
```

**Frontend Testing:**

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in CI mode
npm run test:ci
```

### Sample Test Output

```
🧪 Running FlakeSense Backend Tests
==================================
📦 Installing dependencies...
🔍 Running tests with coverage...

==================== test session starts ====================
collected 25 items

tests/test_api.py::TestFlakeSenseAPI::test_run_tests_endpoint_returns_200 PASSED
tests/test_api.py::TestFlakeSenseAPI::test_get_results_endpoint_returns_json PASSED
tests/test_classification.py::TestClassificationLogic::test_timeout_error_classified_as_flaky PASSED
tests/test_classification.py::TestClassificationLogic::test_real_bug_classification PASSED

==================== 25 passed, 0 failed ====================

✅ All tests passed successfully!
```

## Test Scenarios Covered

### Backend API Testing

- ✅ **Endpoint Validation**: HTTP status codes, response formats
- ✅ **Data Persistence**: In-memory storage functionality
- ✅ **Error Handling**: Invalid requests and edge cases
- ✅ **CORS Configuration**: Cross-origin request handling

### Classification Logic Testing

- ✅ **Flaky Test Detection**: Timeout-based failure classification
- ✅ **Infrastructure Issue Identification**: Element not found errors
- ✅ **Real Bug Classification**: Assertion error handling
- ✅ **Edge Case Handling**: Unknown error types and boundary conditions

### Frontend Integration Testing

- ✅ **User Workflow Testing**: Complete user journey simulation
- ✅ **API Integration**: Frontend-backend communication
- ✅ **UI Component Testing**: Button clicks, form submissions
- ✅ **State Management**: Data loading and display
- ✅ **Error Boundary Testing**: Network failure scenarios

### Positive Test Coverage

- Valid API endpoints return expected responses
- Successful test runs populate results correctly
- UI components render and function as expected
- Data flows properly between frontend and backend

### Negative Test Coverage

- Invalid HTTP methods return appropriate errors
- Network failures are handled gracefully
- Malformed data doesn't crash the application
- Empty states are displayed correctly

## Folder Structure

```
FlakeSense/
├── README.md                           # Project documentation
├── Dockerfile                          # Container configuration
├── run_all_tests.sh                   # Complete test suite runner
├── TEST_IMPLEMENTATION_SUMMARY.md     # Testing implementation details
├── TESTING.md                          # Testing strategy documentation
│
├── backend/                           # Python Flask backend
│   ├── app.py                         # Main Flask application
│   ├── requirements.txt               # Python dependencies
│   ├── pytest.ini                     # Pytest configuration
│   ├── run_tests.sh                   # Backend test runner
│   └── tests/                         # Backend test suite
│       ├── __init__.py
│       ├── test_api.py                # API endpoint tests
│       └── test_classification.py     # Classification logic tests
│
├── frontend/                          # React TypeScript frontend
│   ├── package.json                   # Node.js dependencies
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── run_tests.sh                   # Frontend test runner
│   ├── public/                        # Static assets
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── manifest.json
│   └── src/                           # Source code
│       ├── App.tsx                    # Main React component
│       ├── App.css                    # Styling
│       ├── index.tsx                  # Entry point
│       └── __tests__/                 # Frontend test suite
│           ├── App.integration.test.tsx
│           ├── testUtils.ts
│           └── utils.ts
│
└── tests/                             # Additional test resources
```

## CI/CD Integration

The project includes comprehensive test automation scripts that can be easily integrated into CI/CD pipelines:

- **Automated Test Execution**: `run_all_tests.sh` provides a single command to run all tests
- **Coverage Reporting**: Both backend and frontend generate detailed coverage reports
- **Exit Code Handling**: Scripts return appropriate exit codes for CI/CD integration
- **Cross-platform Support**: Compatible with Linux, macOS, and Windows environments

### GitHub Actions Integration Example

```yaml
name: FlakeSense Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Complete Test Suite
        run: ./run_all_tests.sh
```

## Running the Application

### Start Backend Server

```bash
cd backend
python app.py
# Server runs on http://localhost:5000
```

### Start Frontend Development Server

```bash
cd frontend
npm start
# Application runs on http://localhost:3000
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact Information

**Vinay Surwase**  

- 📧 Email: vinaydsurwase@gmail.com
- 🐙 GitHub: [github.com/vinaysurwase](https://github.com/VinaySurwase)
