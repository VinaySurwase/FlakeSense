#!/bin/bash

# FlakeSense Frontend Test Runner
echo "🧪 Running FlakeSense Frontend Tests"
echo "===================================="

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run linting (if ESLint is configured)
echo ""
echo "🔍 Running ESLint..."
npm run lint 2>/dev/null || echo "⚠️  ESLint not configured, skipping..."

# Run tests in different modes
echo ""
echo "🧪 Running all tests..."
npm test -- --watchAll=false --verbose

echo ""
echo "📊 Running tests with coverage..."
npm run test:coverage

# Run specific test suites
echo ""
echo "🎯 Running main App tests..."
npm test -- --testPathPattern=App.test.tsx --watchAll=false --verbose

echo ""
echo "🔗 Running integration tests..."
npm test -- --testPathPattern=integration --watchAll=false --verbose

# Build the project to ensure it compiles
echo ""
echo "🏗️  Building project..."
npm run build

echo ""
echo "✅ All tests completed!"
echo ""
echo "📈 Coverage report generated in coverage/ directory"
echo "🌐 Open coverage/lcov-report/index.html to view detailed coverage report"
