# Selenium Test Cases for Blogging Application

This directory contains automated Selenium test cases written in Java using TestNG framework.

## Test Cases (10 Total)

1. **testHomePageLoads** - Verifies home page loads successfully
2. **testPageTitle** - Verifies page title is correct
3. **testHeaderPresent** - Verifies header/body is present
4. **testNavigationExists** - Verifies navigation is accessible
5. **testRootDivExists** - Verifies React root div exists
6. **testCorrectURL** - Verifies page URL is correct
7. **testPageLoadTime** - Verifies page loads within timeout
8. **testJavaScriptExecution** - Verifies JavaScript execution
9. **testHTMLTagExists** - Verifies HTML tag exists
10. **testHeadSectionExists** - Verifies head section exists

## Requirements

- Java 11+
- Maven 3.6+
- Chrome Browser (for local testing)
- ChromeDriver (managed automatically by WebDriverManager)

## Running Tests Locally

```bash
# Navigate to test directory
cd selenium-tests-java

# Run tests
mvn clean test

# Run tests with custom URL
mvn clean test -DAPP_URL=http://localhost:8081
```

## Running Tests in Docker

```bash
# Using pre-built image with Chrome
docker run --rm -v $(pwd):/workspace -w /workspace \
  markhobson/maven-chrome:latest \
  mvn clean test -DAPP_URL=http://host.docker.internal:8081
```

## Test Reports

After running tests, reports are generated in:
- `target/surefire-reports/` - TestNG XML and HTML reports
- Console output with test results
