import unittest
from unittest.mock import patch, MagicMock
import sys
import os

# Add the parent directory to the path so we can import app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import simulate_test_run, test_results


class TestClassificationLogic(unittest.TestCase):
    """Test suite for test failure classification logic"""
    
    def setUp(self):
        """Clear test results before each test"""
        test_results.clear()
    
    def tearDown(self):
        """Clean up after each test"""
        test_results.clear()
    
    @patch('app.random.random')
    @patch('app.random.choice')
    def test_timeout_error_classified_as_flaky(self, mock_choice, mock_random):
        """Test that TimeoutError logs are classified as 'Flaky' and marked as flaky"""
        # Set up mocks to create deterministic behavior
        mock_random.return_value = 0.2  # Will cause failure (< 0.3)
        mock_choice.return_value = "TimeoutError"
        
        # Run simulation
        simulate_test_run()
        
        # Check that we have results
        self.assertEqual(len(test_results), 3)
        
        # All should be failures with TimeoutError
        for result in test_results:
            self.assertEqual(result['status'], 'Fail')
            self.assertIn('TimeoutError', result['log'])
            self.assertEqual(result['type'], 'Flaky')
            self.assertTrue(result['flaky'])
    
    @patch('app.random.random')
    @patch('app.random.choice')
    def test_element_not_found_classified_as_infra_issue(self, mock_choice, mock_random):
        """Test that ElementNotFoundError logs are classified as 'Infra Issue'"""
        # Set up mocks to create deterministic behavior
        mock_random.return_value = 0.2  # Will cause failure (< 0.3)
        mock_choice.return_value = "ElementNotFoundError"
        
        # Run simulation
        simulate_test_run()
        
        # Check that we have results
        self.assertEqual(len(test_results), 3)
        
        # All should be failures with ElementNotFoundError
        for result in test_results:
            self.assertEqual(result['status'], 'Fail')
            self.assertIn('ElementNotFoundError', result['log'])
            self.assertEqual(result['type'], 'Infra Issue')
            self.assertFalse(result['flaky'])  # Not flaky
    
    @patch('app.random.random')
    @patch('app.random.choice')
    def test_assertion_error_classified_as_real_bug(self, mock_choice, mock_random):
        """Test that AssertionError logs are classified as 'Real Bug'"""
        # Set up mocks to create deterministic behavior
        mock_random.return_value = 0.2  # Will cause failure (< 0.3)
        mock_choice.return_value = "AssertionError"
        
        # Run simulation
        simulate_test_run()
        
        # Check that we have results
        self.assertEqual(len(test_results), 3)
        
        # All should be failures with AssertionError
        for result in test_results:
            self.assertEqual(result['status'], 'Fail')
            self.assertIn('AssertionError', result['log'])
            self.assertEqual(result['type'], 'Real Bug')
            self.assertFalse(result['flaky'])  # Not flaky
    
    @patch('app.random.random')
    def test_passing_tests_have_empty_classification(self, mock_random):
        """Test that passing tests have appropriate empty fields"""
        # Set up mock to make all tests pass
        mock_random.return_value = 0.8  # Will cause pass (> 0.3)
        
        # Run simulation
        simulate_test_run()
        
        # Check that we have results
        self.assertEqual(len(test_results), 3)
        
        # All should be passes
        for result in test_results:
            self.assertEqual(result['status'], 'Pass')
            self.assertEqual(result['log'], '')
            self.assertEqual(result['type'], '')
            self.assertFalse(result['flaky'])
    
    @patch('app.random.random')
    @patch('app.random.choice')
    def test_unknown_error_classified_as_unknown(self, mock_choice, mock_random):
        """Test that unknown errors are classified as 'Unknown'"""
        # Set up mocks to create deterministic behavior
        mock_random.return_value = 0.2  # Will cause failure (< 0.3)
        mock_choice.return_value = "SomeUnknownError"
        
        # Run simulation
        simulate_test_run()
        
        # Check that we have results
        self.assertEqual(len(test_results), 3)
        
        # All should be failures with unknown classification
        for result in test_results:
            self.assertEqual(result['status'], 'Fail')
            self.assertIn('SomeUnknownError', result['log'])
            self.assertEqual(result['type'], 'Unknown')
            self.assertFalse(result['flaky'])  # Not flaky
    
    @patch('app.random.random')
    @patch('app.random.choice')
    def test_mixed_error_types(self, mock_choice, mock_random):
        """Test classification with mixed error types"""
        # Create a more complex scenario with different errors for different tests
        mock_random.return_value = 0.2  # All fail
        
        # Different errors for each test call
        mock_choice.side_effect = ["TimeoutError", "ElementNotFoundError", "AssertionError"]
        
        # Run simulation
        simulate_test_run()
        
        # Check that we have results
        self.assertEqual(len(test_results), 3)
        
        # Check each result based on the order (login, payment, signup)
        timeout_result = next(r for r in test_results if r['name'] == 'login')
        element_result = next(r for r in test_results if r['name'] == 'payment')
        assertion_result = next(r for r in test_results if r['name'] == 'signup')
        
        # Timeout should be flaky
        self.assertEqual(timeout_result['type'], 'Flaky')
        self.assertTrue(timeout_result['flaky'])
        
        # Element not found should be infra issue
        self.assertEqual(element_result['type'], 'Infra Issue')
        self.assertFalse(element_result['flaky'])
        
        # Assertion should be real bug
        self.assertEqual(assertion_result['type'], 'Real Bug')
        self.assertFalse(assertion_result['flaky'])
    
    def test_test_names_are_consistent(self):
        """Test that the expected test names are always generated"""
        # Run simulation multiple times
        for _ in range(5):
            test_results.clear()
            simulate_test_run()
            
            # Should always have exactly 3 tests
            self.assertEqual(len(test_results), 3)
            
            # Should always have these test names
            test_names = {result['name'] for result in test_results}
            expected_names = {'login', 'payment', 'signup'}
            self.assertEqual(test_names, expected_names)
    
    def test_timestamp_format(self):
        """Test that timestamps are in ISO format"""
        simulate_test_run()
        
        for result in test_results:
            timestamp = result['timestamp']
            # Should be able to parse as ISO format
            from datetime import datetime
            try:
                datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            except ValueError:
                self.fail(f"Timestamp {timestamp} is not in valid ISO format")


class TestErrorClassificationEdgeCases(unittest.TestCase):
    """Test edge cases in error classification"""
    
    def setUp(self):
        test_results.clear()
    
    def tearDown(self):
        test_results.clear()
    
    @patch('app.random.random')
    @patch('app.random.choice')
    def test_case_sensitivity_in_classification(self, mock_choice, mock_random):
        """Test that classification is case-sensitive as expected"""
        mock_random.return_value = 0.2  # Failure
        
        # Test with different case
        mock_choice.return_value = "timeoutError"  # lowercase 't'
        
        simulate_test_run()
        
        # Should not be classified as Flaky due to case sensitivity
        for result in test_results:
            self.assertNotEqual(result['type'], 'Flaky')
            self.assertEqual(result['type'], 'Unknown')
    
    @patch('app.random.random')
    @patch('app.random.choice')
    def test_partial_string_matching(self, mock_choice, mock_random):
        """Test how partial string matching works in classification"""
        mock_random.return_value = 0.2  # Failure
        
        # Test with error that contains the keyword
        mock_choice.return_value = "SomeTimeoutError"  # Contains "Timeout"
        
        simulate_test_run()
        
        # Should be classified as Flaky because it contains "Timeout"
        for result in test_results:
            self.assertEqual(result['type'], 'Flaky')
            self.assertTrue(result['flaky'])


if __name__ == '__main__':
    unittest.main()
