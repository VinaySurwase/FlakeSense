#!/bin/bash

# FlakeSense Backend Test Runner
echo "🧪 Running FlakeSense Backend Tests"
echo "=================================="

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
    echo "📦 Activating virtual environment..."
    source .venv/bin/activate
fi

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Run tests with coverage
echo "🔍 Running tests with coverage..."
python -m pytest

# Run specific test categories
echo ""
echo "🔍 Running API tests..."
python -m pytest tests/test_api.py -v

echo ""
echo "🔍 Running classification tests..."
python -m pytest tests/test_classification.py -v

# Run tests with unittest as fallback
echo ""
echo "🔄 Running with unittest (fallback)..."
python -m unittest discover tests/ -v

echo ""
echo "✅ Test run complete!"
