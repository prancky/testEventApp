# 📊 Maestro E2E Test Reporting System

## Overview

This project includes a comprehensive test reporting system that generates professional HTML and JSON reports.

## Features

- 📊 **Professional HTML Reports**: Beautiful, interactive reports with test suite navigation
- 📋 **Structured JSON Reports**: Machine-readable test results for CI/CD integration  
- 📈 **Execution Statistics**: Pass/fail rates, execution times, and coverage metrics
- 🔍 **Detailed Test Information**: Test titles, descriptions, steps, and preconditions
- 🚨 **Error Tracking**: Capture and display test failures with detailed error messages
- 📱 **Responsive Design**: Mobile-friendly report viewing

## Report Generation

### Automatic Generation (Recommended)

Test reports are automatically generated after running tests:

```bash
# Run tests and generate reports automatically
yarn e2e:dev-test-android      # Android tests with reports
yarn e2e:dev-test-ios          # iOS tests with reports
yarn e2e:test-and-report       # Run tests and open HTML report
```

### Manual Report Generation

Generate reports from existing test logs:

```bash
# Generate reports manually
yarn e2e:generate-report

# Open the HTML report
yarn e2e:open-report
```

### Advanced Usage

```bash
# Custom report generation with specific paths
node generateTestReport.js [masterSuitePath] [suiteDirectory] [logPath] [outputDir] [metadataPath]

# Example:
node generateTestReport.js e2e/master_suite.yaml e2e maestro-detailed-output.log custom-reports test-metadata.json
```

## Report Structure

### HTML Report Features

- **Dashboard Overview**: Total suites, tests, pass/fail statistics
- **Progress Bars**: Visual representation of test execution status
- **Collapsible Suites**: Expandable test suite sections
- **Test Details**: Individual test case information with descriptions
- **Error Display**: Formatted error messages and stack traces
- **Execution Timeline**: Test execution times and performance metrics

### JSON Report Structure

```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "appName": "YourApp",
  "totalSuites": 25,
  "totalTests": 672,
  "passedTests": 650,
  "failedTests": 10,
  "skippedTests": 0,
  "pendingTests": 12,
  "executionTime": 45000,
  "suites": [
    {
      "id": "suite_1",
      "name": "SignInScreen",
      "file": "signInScreen.yaml", 
      "testCount": 34,
      "status": "passed",
      "tests": [
        {
          "id": "test_1",
          "title": "Verify login functionality",
          "description": "This test case checks if the login works correctly",
          "status": "passed",
          "steps": [...],
          "preconditions": [...]
        }
      ]
    }
  ],
  "summary": {
    "status": "passed",
    "coverage": {
      "passRate": "96.73",
      "failRate": "1.49", 
      "skipRate": "0.00",
      "pendingRate": "1.78"
    }
  }
}
```

## Test Status Types

- **Passed** ✅: Test executed successfully
- **Failed** ❌: Test execution failed with errors
- **Pending** ⏳: Test not yet executed (default state)
- **Skipped** ⏭️: Test intentionally skipped during execution

 
## Files Generated

- `test-reports/test-report.html` - Interactive HTML report
- `test-reports/test-report.json` - Machine-readable JSON report  
- `test-metadata.json` - SDK-generated test metadata
- `maestro-detailed-output.log` - Raw Maestro execution log
- `maestro-test-results.json` - Parsed execution results

## Customization

### Custom Report Styling
Modify the CSS in `generateTestReport.js` to customize the HTML report appearance.

### Additional Metrics
Extend the `TestReportGenerator` class to add custom metrics and analysis.

### Integration with Other Tools
The JSON report format is compatible with most CI/CD tools and test management systems.
