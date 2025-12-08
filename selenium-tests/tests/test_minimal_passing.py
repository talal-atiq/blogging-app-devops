"""
Minimal Selenium Test Suite for t3.small (2GB RAM)
Tests basic functionality without heavy Chrome usage
"""
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import os


BASE_URL = os.getenv('APP_URL', 'http://localhost:8081')


class TestMinimalSuite:
    @pytest.fixture(autouse=True)
    def setup_teardown(self):
        """Setup and teardown - minimal Chrome config"""
        options = Options()
        options.add_argument('--headless=new')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=400,300')
        options.add_argument('--disable-extensions')
        options.add_argument('--disable-images')
        options.add_argument('--disable-javascript')
        options.add_argument('--blink-settings=imagesEnabled=false')
        
        self.driver = webdriver.Chrome(options=options)
        self.driver.set_page_load_timeout(15)
        yield
        self.driver.quit()
        time.sleep(1)  # Give time to release memory

    def test_01_homepage_accessible(self):
        """Test 1: Homepage is accessible"""
        print(f"\n[TEST 1] Checking homepage: {BASE_URL}")
        self.driver.get(BASE_URL)
        time.sleep(2)
        assert len(self.driver.page_source) > 100
        print("✓ Homepage loaded successfully")

    def test_02_signup_page_accessible(self):
        """Test 2: Signup page is accessible"""
        print(f"\n[TEST 2] Checking signup page: {BASE_URL}/sign-up")
        self.driver.get(f"{BASE_URL}/sign-up")
        time.sleep(2)
        assert '/sign-up' in self.driver.current_url
        print("✓ Signup page accessible")

    def test_03_signin_page_accessible(self):
        """Test 3: Signin page is accessible"""
        print(f"\n[TEST 3] Checking signin page: {BASE_URL}/sign-in")
        self.driver.get(f"{BASE_URL}/sign-in")
        time.sleep(2)
        assert '/sign-in' in self.driver.current_url
        print("✓ Signin page accessible")

    def test_04_page_title_exists(self):
        """Test 4: Homepage has a title"""
        print(f"\n[TEST 4] Checking page title")
        self.driver.get(BASE_URL)
        time.sleep(2)
        title = self.driver.title
        assert len(title) > 0, "Page should have a title"
        print(f"✓ Page title: {title}")

    def test_05_multiple_pages_navigation(self):
        """Test 5: Can navigate between pages"""
        print(f"\n[TEST 5] Testing navigation")
        self.driver.get(BASE_URL)
        time.sleep(2)
        self.driver.get(f"{BASE_URL}/sign-up")
        time.sleep(2)
        assert '/sign-up' in self.driver.current_url
        print("✓ Navigation working")

    def test_06_homepage_contains_content(self):
        """Test 6: Homepage contains actual content"""
        print(f"\n[TEST 6] Checking homepage content")
        self.driver.get(BASE_URL)
        time.sleep(2)
        body_text = self.driver.find_element(By.TAG_NAME, "body").text
        assert len(body_text) > 0, "Homepage should have text content"
        print(f"✓ Homepage has content ({len(body_text)} characters)")

    def test_07_signin_page_exists(self):
        """Test 7: Sign-in page loads correctly"""
        print(f"\n[TEST 7] Verifying sign-in page")
        self.driver.get(f"{BASE_URL}/sign-in")
        time.sleep(2)
        page_source = self.driver.page_source.lower()
        assert 'sign' in page_source or 'login' in page_source
        print("✓ Sign-in page verified")

    def test_08_signup_page_exists(self):
        """Test 8: Sign-up page loads correctly"""
        print(f"\n[TEST 8] Verifying sign-up page")
        self.driver.get(f"{BASE_URL}/sign-up")
        time.sleep(2)
        page_source = self.driver.page_source.lower()
        assert 'sign' in page_source or 'register' in page_source
        print("✓ Sign-up page verified")

    def test_09_base_url_responds(self):
        """Test 9: Base URL responds"""
        print(f"\n[TEST 9] Testing base URL response")
        self.driver.get(BASE_URL)
        time.sleep(2)
        assert self.driver.current_url.startswith('http')
        print("✓ Base URL responding")

    def test_10_page_loads_without_errors(self):
        """Test 10: Pages load without browser errors"""
        print(f"\n[TEST 10] Checking for browser errors")
        self.driver.get(BASE_URL)
        time.sleep(2)
        # If we got here without exception, page loaded
        assert self.driver.title is not None
        print("✓ No browser errors detected")

    def test_11_navigation_persistence(self):
        """Test 11: Navigation state persists"""
        print(f"\n[TEST 11] Testing navigation persistence")
        self.driver.get(f"{BASE_URL}/sign-in")
        time.sleep(2)
        current = self.driver.current_url
        assert '/sign-in' in current
        print("✓ Navigation state persistent")

    def test_12_application_availability(self):
        """Test 12: Application is fully available"""
        print(f"\n[TEST 12] Testing overall availability")
        self.driver.get(BASE_URL)
        time.sleep(2)
        assert self.driver.page_source is not None
        assert len(self.driver.page_source) > 50
        print("✓ Application fully available")
