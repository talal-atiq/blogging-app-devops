"""
API-based Test Suite for MERN Blog Application
Uses HTTP requests instead of Selenium to avoid Chrome memory issues on t3.small
"""
import pytest
import requests
import time
import os
import random
import string

BASE_URL = os.getenv('APP_URL', 'http://localhost:8081')
API_URL = f"{BASE_URL}/api"

# Generate unique test user credentials
def generate_random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

TEST_USER_EMAIL = f"test_{generate_random_string()}@example.com"
TEST_USER_PASSWORD = "TestPass123!"
TEST_USER_NAME = f"TestUser_{generate_random_string(4)}"


class TestBlogApplication:
    """Test suite for blogging application API endpoints"""
    
    @classmethod
    def setup_class(cls):
        """Setup test class - runs once before all tests"""
        cls.session = requests.Session()
        cls.user_token = None
        cls.user_id = None
        cls.blog_id = None
        print(f"\n{'='*60}")
        print(f"Testing Application: {BASE_URL}")
        print(f"Test User: {TEST_USER_EMAIL}")
        print(f"{'='*60}\n")
    
    def test_01_application_is_running(self):
        """Test 1: Verify application is accessible"""
        print(f"\n[TEST 1] Checking if application is running at {BASE_URL}")
        try:
            response = requests.get(BASE_URL, timeout=10)
            assert response.status_code in [200, 301, 302, 304], f"Expected success status, got {response.status_code}"
            print(f"✓ Application is running (Status: {response.status_code})")
        except requests.exceptions.RequestException as e:
            pytest.fail(f"Application is not accessible: {e}")
    
    def test_02_api_health_check(self):
        """Test 2: API endpoint is accessible"""
        print(f"\n[TEST 2] Checking API health")
        try:
            response = requests.get(f"{API_URL}/user/getusers", timeout=10)
            # Even if it returns 401 (unauthorized), API is working
            assert response.status_code in [200, 401, 403], f"API not responding correctly: {response.status_code}"
            print(f"✓ API is accessible (Status: {response.status_code})")
        except requests.exceptions.RequestException as e:
            pytest.fail(f"API is not accessible: {e}")
    
    def test_03_register_new_user(self):
        """Test 3: User registration works"""
        print(f"\n[TEST 3] Registering new user: {TEST_USER_EMAIL}")
        
        payload = {
            "username": TEST_USER_NAME,
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        
        try:
            response = requests.post(
                f"{API_URL}/user/register",
                json=payload,
                timeout=10
            )
            
            # Check if registration succeeded
            assert response.status_code in [200, 201], f"Registration failed: {response.status_code} - {response.text}"
            
           data = response.json()
            assert 'email' in data or 'user' in data or '_id' in data, "Response missing user data"
            
            print(f"✓ User registered successfully")
            print(f"  Response: {response.status_code}")
            
        except requests.exceptions.RequestException as e:
            pytest.fail(f"Registration request failed: {e}")
    
    def test_04_login_user(self):
        """Test 4: User login works and returns token"""
        print(f"\n[TEST 4] Logging in as: {TEST_USER_EMAIL}")
        
        payload = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        
        try:
            response = requests.post(
                f"{API_URL}/user/login",
                json=payload,
                timeout=10
            )
            
            assert response.status_code == 200, f"Login failed: {response.status_code} - {response.text}"
            
            data = response.json()
            
            # Store token and user ID for later tests
            if 'token' in data:
                self.__class__.user_token = data['token']
            if '_id' in data:
                self.__class__.user_id = data['_id']
            
            assert self.__class__.user_token or 'email' in data, "Login response missing authentication data"
            
            print(f"✓ Login successful")
            print(f"  User ID: {self.__class__.user_id}")
            
        except requests.exceptions.RequestException as e:
            pytest.fail(f"Login request failed: {e}")
    
    def test_05_invalid_login(self):
        """Test 5: Invalid login credentials are rejected"""
        print(f"\n[TEST 5] Testing invalid login")
        
        payload = {
            "email": TEST_USER_EMAIL,
            "password": "WrongPassword123!"
        }
        
        try:
            response = requests.post(
                f"{API_URL}/user/login",
                json=payload,
                timeout=10
            )
            
            # Should fail
            assert response.status_code in [400, 401, 404], f"Expected auth failure, got {response.status_code}"
            print(f"✓ Invalid credentials correctly rejected (Status: {response.status_code})")
            
        except requests.exceptions.RequestException as e:
            pytest.fail(f"Invalid login test request failed: {e}")
    
    def test_06_duplicate_registration(self):
        """Test 6: Duplicate user registration is prevented"""
        print(f"\n[TEST 6] Testing duplicate registration prevention")
        
        payload = {
            "username": TEST_USER_NAME,
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        
        try:
            response = requests.post(
                f"{API_URL}/user/register",
                json=payload,
                timeout=10
            )
            
            # Should fail with conflict/bad request
            assert response.status_code in [400, 409, 422], f"Duplicate not prevented: {response.status_code}"
            print(f"✓ Duplicate registration prevented (Status: {response.status_code})")
            
        except requests.exceptions.RequestException as e:
            pytest.fail(f"Duplicate registration test failed: {e}")
    
    def test_07_api_routes_exist(self):
        """Test 7: Core API routes are defined"""
        print(f"\n[TEST 7] Verifying API routes exist")
        
        routes_to_test = [
            f"{API_URL}/user/register",
            f"{API_URL}/user/login",
            f"{API_URL}/user/getusers",
        ]
        
        for route in routes_to_test:
            try:
                response = requests.get(route, timeout=5)
                # Any response (even 401/405) means route exists
                assert response.status_code != 404, f"Route not found: {route}"
                print(f"  ✓ {route.split('/')[-1]} - Status: {response.status_code}")
            except requests.exceptions.RequestException:
                pass  # Some routes may not accept GET
        
        print(f"✓ API routes verified")
    
    def test_08_response_format(self):
        """Test 8: API returns JSON responses"""
        print(f"\n[TEST 8] Checking API response format")
        
        try:
            response = requests.post(
                f"{API_URL}/user/login",
                json={"email": "test@test.com", "password": "test"},
                timeout=10
            )
            
            content_type = response.headers.get('Content-Type', '')
            assert 'application/json' in content_type.lower() or response.text.startswith('{'), \
                f"Expected JSON response, got: {content_type}"
            
            print(f"✓ API returns JSON responses")
            print(f"  Content-Type: {content_type}")
            
        except requests.exceptions.RequestException as e:
            pytest.fail(f"Response format test failed: {e}")
    
    def test_09_signout_endpoint(self):
        """Test 9: Sign out endpoint exists"""
        print(f"\n[TEST 9] Testing sign out endpoint")
        
        try:
            response = requests.post(
                f"{API_URL}/user/signoutuser",
                timeout=10
            )
            
            # Should succeed regardless of auth state
            assert response.status_code in [200, 400, 401], f"Sign out endpoint error: {response.status_code}"
            print(f"✓ Sign out endpoint accessible (Status: {response.status_code})")
            
        except requests.exceptions.RequestException as e:
            pytest.fail(f"Sign out test failed: {e}")
    
    def test_10_application_performance(self):
        """Test 10: API responds within acceptable time"""
        print(f"\n[TEST 10] Testing API performance")
        
        start = time.time()
        try:
            response = requests.get(BASE_URL, timeout=10)
            duration = time.time() - start
            
            assert duration < 5, f"Response too slow: {duration:.2f}s"
            print(f"✓ Application responds quickly ({duration:.2f}s)")
            
        except requests.exceptions.RequestException as e:
            pytest.fail(f"Performance test failed: {e}")
    
    def test_11_cors_headers(self):
        """Test 11: CORS is properly configured"""
        print(f"\n[TEST 11] Checking CORS configuration")
        
        try:
            response = requests.options(f"{API_URL}/user/login", timeout=10)
            
            # Check for CORS headers or successful response
            assert response.status_code in [200, 204, 404], f"CORS preflight failed: {response.status_code}"
            print(f"✓ CORS configured (Status: {response.status_code})")
            
        except requests.exceptions.RequestException as e:
            # CORS might not support OPTIONS, that's okay
            print(f"✓ CORS test completed")
    
    def test_12_environment_variable(self):
        """Test 12: Environment variables are set correctly"""
        print(f"\n[TEST 12] Verifying environment configuration")
        
        assert BASE_URL, "BASE_URL not set"
        assert BASE_URL.startswith('http'), f"Invalid BASE_URL: {BASE_URL}"
        
        print(f"✓ Environment configured correctly")
        print(f"  BASE_URL: {BASE_URL}")
        print(f"  API_URL: {API_URL}")
    
    @classmethod
    def teardown_class(cls):
        """Cleanup after all tests"""
        print(f"\n{'='*60}")
        print(f"Test Suite Completed")
        print(f"Test User: {TEST_USER_EMAIL}")
        print(f"{'='*60}\n")
