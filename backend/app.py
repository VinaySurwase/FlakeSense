from flask import Flask, jsonify, request
from flask_cors import CORS
import random
from datetime import datetime

app = Flask(__name__)
CORS(app)

# In-memory log of test results
test_results = []

# Simulate 3 test cases with randomized failures
def simulate_test_run():
    tests = ['login', 'payment', 'signup']
    for name in tests:
        passed = random.random() > 0.3  # 70% pass rate
        log = ""
        test_type = ""
        flaky = False

        if passed:
            status = "Pass"
        else:
            # Random failure cause
            error = random.choice(["TimeoutError", "ElementNotFoundError", "AssertionError"])
            log = f"{error}: simulated failure for {name}"
            status = "Fail"

            # Classify error type
            if "Timeout" in log:
                test_type = "Flaky"
                flaky = True
            elif "ElementNotFound" in log:
                test_type = "Infra Issue"
            elif "AssertionError" in log:
                test_type = "Real Bug"
            else:
                test_type = "Unknown"

        test_results.append({
            "name": name,
            "status": status,
            "type": test_type,
            "flaky": flaky,
            "log": log,
            "timestamp": datetime.now().isoformat()
        })

@app.route('/run-tests', methods=['POST'])
def run_tests():
    simulate_test_run()
    return jsonify({"message": "Test run complete"}), 200

@app.route('/results', methods=['GET'])
def get_results():
    return jsonify(test_results)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
