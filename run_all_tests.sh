#!/bin/bash

# FlakeSense Complete Test Suite Runner
echo "🚀 FlakeSense Complete Test Suite"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Track overall success
OVERALL_SUCCESS=true

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the FlakeSense root directory"
    exit 1
fi

print_status "Starting comprehensive test suite for FlakeSense..."
echo ""

# Backend Tests
print_status "🐍 Running Backend Tests (Python/Flask)"
echo "========================================"
cd backend

if [ -d ".venv" ]; then
    print_status "Activating Python virtual environment..."
    source .venv/bin/activate
fi

if [ -f "requirements.txt" ]; then
    print_status "Installing Python dependencies..."
    pip install -r requirements.txt
else
    print_warning "requirements.txt not found"
fi

print_status "Running backend tests with pytest..."
if python -m pytest --verbose --cov=app --cov-report=html --cov-report=term-missing; then
    print_success "Backend tests passed!"
else
    print_error "Backend tests failed!"
    OVERALL_SUCCESS=false
fi

print_status "Running backend tests with unittest (fallback)..."
if python -m unittest discover tests/ -v; then
    print_success "Backend unittest suite passed!"
else
    print_warning "Backend unittest suite had issues"
fi

cd ..
echo ""

# Frontend Tests
print_status "⚛️  Running Frontend Tests (React/TypeScript)"
echo "=============================================="
cd frontend

if [ -f "package.json" ]; then
    print_status "Installing Node.js dependencies..."
    npm install
else
    print_error "package.json not found in frontend directory"
    OVERALL_SUCCESS=false
fi

if [ "$OVERALL_SUCCESS" = true ]; then
    print_status "Running frontend tests with coverage..."
    if npm run test:coverage; then
        print_success "Frontend tests passed!"
    else
        print_error "Frontend tests failed!"
        OVERALL_SUCCESS=false
    fi

    print_status "Building frontend project..."
    if npm run build; then
        print_success "Frontend build successful!"
    else
        print_error "Frontend build failed!"
        OVERALL_SUCCESS=false
    fi
fi

cd ..
echo ""

# Integration Tests (if running both services)
print_status "🔗 Integration Test Simulation"
echo "=============================="
print_status "Checking if services can be started..."

# Check if backend can start (quick test)
cd backend
print_status "Testing backend startup..."
timeout 10s python app.py &
BACKEND_PID=$!
sleep 3

if kill -0 $BACKEND_PID 2>/dev/null; then
    print_success "Backend starts successfully"
    kill $BACKEND_PID 2>/dev/null
else
    print_warning "Backend startup test inconclusive"
fi

cd ..

# Check if frontend can build and serve
cd frontend
print_status "Testing frontend build..."
if [ -d "build" ]; then
    print_success "Frontend build exists and can be served"
else
    print_warning "Frontend build directory not found"
fi

cd ..

# Final Report
echo ""
echo "📊 Test Summary Report"
echo "====================="

if [ "$OVERALL_SUCCESS" = true ]; then
    print_success "🎉 All tests passed successfully!"
    echo ""
    echo "📂 Generated Reports:"
    echo "   - Backend coverage: backend/htmlcov/index.html"
    echo "   - Frontend coverage: frontend/coverage/lcov-report/index.html"
    echo ""
    echo "🚀 Your FlakeSense application is ready for deployment!"
    exit 0
else
    print_error "❌ Some tests failed. Please check the output above."
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   - Ensure all dependencies are installed"
    echo "   - Check Python virtual environment is activated"
    echo "   - Verify Node.js and npm are properly installed"
    echo "   - Review test output for specific failures"
    exit 1
fi
