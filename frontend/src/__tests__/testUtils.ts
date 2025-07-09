// Test utilities for FlakeSense frontend tests

export interface MockTestResult {
  name: string;
  status: 'Pass' | 'Fail';
  type: string;
  flaky: boolean;
  log: string;
  timestamp: string;
}

// Factory function to create mock test results
export const createMockTestResult = (overrides: Partial<MockTestResult> = {}): MockTestResult => ({
  name: 'default_test',
  status: 'Pass',
  type: '',
  flaky: false,
  log: '',
  timestamp: '2025-07-09T10:00:00.000Z',
  ...overrides
});

// Predefined mock results for common test scenarios
export const mockTestResults = {
  empty: [],
  
  singlePass: [
    createMockTestResult({
      name: 'login',
      status: 'Pass'
    })
  ],
  
  singleFail: [
    createMockTestResult({
      name: 'login',
      status: 'Fail',
      type: 'Real Bug',
      log: 'AssertionError: Expected true but got false'
    })
  ],
  
  singleFlaky: [
    createMockTestResult({
      name: 'login',
      status: 'Fail',
      type: 'Flaky',
      flaky: true,
      log: 'TimeoutError: Element not found within timeout'
    })
  ],
  
  mixedResults: [
    createMockTestResult({
      name: 'login',
      status: 'Pass'
    }),
    createMockTestResult({
      name: 'payment',
      status: 'Fail',
      type: 'Flaky',
      flaky: true,
      log: 'TimeoutError: Payment gateway timeout'
    }),
    createMockTestResult({
      name: 'signup',
      status: 'Fail',
      type: 'Real Bug',
      log: 'AssertionError: Email validation failed'
    }),
    createMockTestResult({
      name: 'logout',
      status: 'Fail',
      type: 'Infra Issue',
      log: 'ElementNotFoundError: Logout button not found'
    })
  ],
  
  allFlaky: [
    createMockTestResult({
      name: 'flaky_test_1',
      status: 'Fail',
      type: 'Flaky',
      flaky: true,
      log: 'TimeoutError: Random timeout 1'
    }),
    createMockTestResult({
      name: 'flaky_test_2',
      status: 'Fail',
      type: 'Flaky',
      flaky: true,
      log: 'TimeoutError: Random timeout 2'
    })
  ]
};

// Mock fetch response factory
export const createMockFetchResponse = (data: any, ok: boolean = true, status: number = 200) => ({
  ok,
  status,
  json: async () => data
});

// Mock fetch error factory
export const createMockFetchError = (message: string = 'Network error') => 
  Promise.reject(new Error(message));

// Helper to mock fetch with specific responses
export const mockFetchSequence = (responses: Array<{ data?: any; error?: string; ok?: boolean; delay?: number }>) => {
  const mockFetch = jest.fn();
  
  responses.forEach((response, index) => {
    if (response.error) {
      mockFetch.mockImplementationOnce(() => 
        response.delay 
          ? new Promise((_, reject) => setTimeout(() => reject(new Error(response.error)), response.delay))
          : Promise.reject(new Error(response.error))
      );
    } else {
      mockFetch.mockImplementationOnce(() => 
        response.delay
          ? new Promise(resolve => setTimeout(() => resolve(createMockFetchResponse(response.data, response.ok)), response.delay))
          : Promise.resolve(createMockFetchResponse(response.data, response.ok))
      );
    }
  });
  
  return mockFetch;
};

// Helper to wait for element with custom timeout
export const waitForElementWithTimeout = async (
  getElement: () => Element | null,
  timeout: number = 5000
): Promise<Element> => {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    const element = getElement();
    if (element) return element;
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  throw new Error(`Element not found within ${timeout}ms`);
};

// Mock console methods for testing error handling
export const mockConsole = () => {
  const originalConsole = { ...console };
  const consoleMock = {
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn()
  };
  
  const setup = () => {
    Object.assign(console, consoleMock);
  };
  
  const teardown = () => {
    Object.assign(console, originalConsole);
    Object.values(consoleMock).forEach(mock => mock.mockReset());
  };
  
  return { setup, teardown, mocks: consoleMock };
};

// This file is just utilities, no tests needed
export {};
