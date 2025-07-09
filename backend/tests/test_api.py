import unittest
import json
from unittest.mock import patch, MagicMock
import sys
import os

# Add the parent directory to the path so we can import app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app, test_results, simulate_test_run


class TestFlakeSenseAPI(unittest.TestCase):
    """Test suite for FlakeSense API endpoints"""
    
    def setUp(self):
        """Set up test client and clear test results before each test"""
        self.client = app.test_client()
        app.config['TESTING'] = True
        test_results.clear()
    
    def tearDown(self):
        """Clean up after each test"""
        test_results.clear()
    
    def test_run_tests_endpoint_returns_200(self):
        """Test that /run-tests endpoint returns HTTP 200"""
        response = self.client.post('/run-tests')
        self.assertEqual(response.status_code, 200)
        
        # Check response message
        data = response.get_json()
        self.assertIn('message', data)
        self.assertEqual(data['message'], 'Test run complete')
    
    def test_run_tests_endpoint_adds_entries(self):
        """Test that /run-tests endpoint adds new test entries to the in-memory list"""
        # Initially empty
        self.assertEqual(len(test_results), 0)
        
        # Run tests
        response = self.client.post('/run-tests')
        self.assertEqual(response.status_code, 200)
        
        # Should have 3 test entries (login, payment, signup)
        self.assertEqual(len(test_results), 3)
        
        # Verify test names are present
        test_names = [result['name'] for result in test_results]
        self.assertIn('login', test_names)
        self.assertIn('payment', test_names)
        self.assertIn('signup', test_names)
    
    def test_run_tests_entry_structure(self):
        """Test that each entry contains the expected keys"""
        response = self.client.post('/run-tests')
        self.assertEqual(response.status_code, 200)
        
        # Check that we have test results
        self.assertTrue(len(test_results) > 0)
        
        # Check structure of first result
        result = test_results[0]
        expected_keys = {'name', 'status', 'type', 'flaky', 'log', 'timestamp'}
        self.assertEqual(set(result.keys()), expected_keys)
        
        # Verify types
        self.assertIsInstance(result['name'], str)
        self.assertIn(result['status'], ['Pass', 'Fail'])
        self.assertIsInstance(result['type'], str)
        self.assertIsInstance(result['flaky'], bool)
        self.assertIsInstance(result['log'], str)
        self.assertIsInstance(result['timestamp'], str)
    
    def test_results_endpoint_returns_all_results(self):
        """Test that /results endpoint returns all previous test results"""
        # First, run some tests to populate results
        self.client.post('/run-tests')
        initial_count = len(test_results)
        
        # Run tests again to add more results
        self.client.post('/run-tests')
        
        # Get results
        response = self.client.get('/results')
        self.assertEqual(response.status_code, 200)
        
        data = response.get_json()
        self.assertIsInstance(data, list)
        
        # Should have results from both runs
        self.assertEqual(len(data), initial_count * 2)
    
    def test_results_endpoint_structure(self):
        """Test that /results endpoint returns properly structured data"""
        # Run tests first
        self.client.post('/run-tests')
        
        # Get results
        response = self.client.get('/results')
        self.assertEqual(response.status_code, 200)
        
        data = response.get_json()
        self.assertIsInstance(data, list)
        
        if len(data) > 0:
            result = data[0]
            expected_keys = {'name', 'status', 'type', 'flaky', 'log', 'timestamp'}
            self.assertEqual(set(result.keys()), expected_keys)
    
    def test_results_endpoint_empty_initially(self):
        """Test that /results endpoint returns empty list when no tests have been run"""
        response = self.client.get('/results')
        self.assertEqual(response.status_code, 200)
        
        data = response.get_json()
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 0)
    
    @patch('app.random.random')
    @patch('app.random.choice')
    def test_multiple_runs_accumulate_results(self, mock_choice, mock_random):
        """Test that multiple test runs accumulate results"""
        # Mock to create deterministic failures
        mock_random.return_value = 0.2  # Will cause failure (< 0.3)
        mock_choice.return_value = "TimeoutError"
        
        # First run
        self.client.post('/run-tests')
        first_count = len(test_results)
        
        # Second run
        self.client.post('/run-tests')
        second_count = len(test_results)
        
        # Should accumulate
        self.assertEqual(second_count, first_count * 2)
        
        # Get via API
        response = self.client.get('/results')
        data = response.get_json()
        self.assertEqual(len(data), second_count)


class TestErrorHandling(unittest.TestCase):
    """Test error handling and edge cases"""
    
    def setUp(self):
        self.client = app.test_client()
        app.config['TESTING'] = True
        test_results.clear()
    
    def test_invalid_http_methods(self):
        """Test that invalid HTTP methods return appropriate errors"""
        # GET on /run-tests should return 405
        response = self.client.get('/run-tests')
        self.assertEqual(response.status_code, 405)
        
        # POST on /results should return 405
        response = self.client.post('/results')
        self.assertEqual(response.status_code, 405)
    
    def test_nonexistent_endpoint(self):
        """Test that nonexistent endpoints return 404"""
        response = self.client.get('/nonexistent')
        self.assertEqual(response.status_code, 404)


if __name__ == '__main__':
    unittest.main()
