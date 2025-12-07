"""
Test Configuration
Store configuration variables for test suite
"""

import os

# Application URL - EC2 instance
BASE_URL = os.getenv('APP_URL', 'http://98.93.37.134:8081')

# Test credentials for regular user
TEST_USER = {
    'username': 'testuser' + str(os.getpid()),  # Unique per test run
    'email': f'testuser{os.getpid()}@test.com',
    'password': 'TestPassword123!'
}

# Admin credentials - IMPORTANT: Create this admin user manually first
# Or use your existing admin credentials from the database
TEST_ADMIN = {
    'email': os.getenv('ADMIN_EMAIL', 'admin@blog.com'),  # Update with your actual admin email
    'password': os.getenv('ADMIN_PASSWORD', 'Admin123!'),  # Update with actual admin password
}

# Timeouts
DEFAULT_TIMEOUT = 10
PAGE_LOAD_TIMEOUT = 30

# Test data
TEST_BLOG_POST = {
    'title': 'Test Blog Post - Selenium Automated Test',
    'content': 'This is a test blog post created by automated Selenium tests. This post is for automated testing purposes and can be safely deleted.',
    'category': 'Technology'
}

# Feature flags
SKIP_ADMIN_TESTS = os.getenv('SKIP_ADMIN_TESTS', 'false').lower() == 'true'  # Set to true to skip admin tests
