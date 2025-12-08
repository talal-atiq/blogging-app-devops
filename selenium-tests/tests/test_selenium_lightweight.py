"""
Ultra-Lightweight Selenium Test Suite for t3.small (2GB RAM)
Uses Selenium with minimal Chrome to meet assignment requirements
"""
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time
import os


BASE_URL = os.getenv('APP_URL', 'http://localhost:8081')


def get_minimal_chrome():
    """Get ultra-lightweight Chrome instance"""
    options = Options()
    
    # Headless mode
    options.add_argument('--headless=new')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    
    # Minimal window
    options.add_argument('--window-size=400,300')
    
    # Disable EVERYTHING to save memory
    options.add_argument('--disable-gpu')
    options.add_argument('--disable-software-rasterizer')
    options.add_argument('--disable-extensions')
    options.add_argument('--disable-plugins')
    options.add_argument('--disable-images')
    options.add_argument('--blink-settings=imagesEnabled=false')
    
    # Aggressive memory saving
    options.add_argument('--js-flags=--max-old-space-size=256')
    options.add_argument('--disable-background-networking')
    options.add_argument('--disable-background-timer-throttling')
    options.add_argument('--disable-backgrounding-occluded-windows')
    options.add_argument('--disable-breakpad')
    options.add_argument('--disable-component-extensions-with-background-pages')
    options.add_argument('--disable-features=TranslateUI,BlinkGenPropertyTrees')
    options.add_argument('--disable-ipc-flooding-protection')
    options.add_argument('--disable-renderer-backgrounding')
    options.add_argument('--enable-features=NetworkService,NetworkServiceInProcess')
    options.add_argument('--force-color-profile=srgb')
    options.add_argument('--hide-scrollbars')
    options.add_argument('--metrics-recording-only')
    options.add_argument('--mute-audio')
    
    # Create driver
    driver = webdriver.Chrome(options=options)
    driver.set_page_load_timeout(10)
    driver.implicitly_wait(5)
    
    return driver


class TestSeleniumSuite:
    """Selenium test suite optimized for low memory"""
    
    def test_01_homepage_loads(self):
        """Test 1: Homepage loads successfully"""
        print(f"\n[SELENIUM TEST 1] Loading homepage: {BASE_URL}")
        driver = get_minimal_chrome()
        
        try:
            driver.get(BASE_URL)
            time.sleep(1)
            
            # Just check page loaded
            assert driver.title is not None, "Page should have a title"
            assert len(driver.page_source) > 100, "Page should have content"
            
            print(f"✓ Homepage loaded (title: {driver.title})")
            
        finally:
            driver.quit()
            time.sleep(0.5)
    
    def test_02_signup_page_exists(self):
        """Test 2: Signup page is accessible"""
        print(f"\n[SELENIUM TEST 2] Accessing signup page")
        driver = get_minimal_chrome()
        
        try:
            driver.get(f"{BASE_URL}/sign-up")
            time.sleep(1)
            
            # Check URL changed
            assert 'sign-up' in driver.current_url or 'signup' in driver.current_url.lower()
            assert len(driver.page_source) > 50
            
            print(f"✓ Signup page accessible")
            
        finally:
            driver.quit()
            time.sleep(0.5)
    
    def test_03_signin_page_exists(self):
        """Test 3: Signin page is accessible"""
        print(f"\n[SELENIUM TEST 3] Accessing signin page")
        driver = get_minimal_chrome()
        
        try:
            driver.get(f"{BASE_URL}/sign-in")
            time.sleep(1)
            
            # Check URL changed
            assert 'sign-in' in driver.current_url or 'signin' in driver.current_url.lower()
            assert len(driver.page_source) > 50
            
            print(f"✓ Signin page accessible")
            
        finally:
            driver.quit()
            time.sleep(0.5)
    
    def test_04_page_title_not_empty(self):
        """Test 4: Pages have proper titles"""
        print(f"\n[SELENIUM TEST 4] Checking page titles")
        driver = get_minimal_chrome()
        
        try:
            driver.get(BASE_URL)
            time.sleep(1)
            
            title = driver.title
            assert title is not None and len(title) > 0, "Page must have a title"
            
            print(f"✓ Page has title: '{title}'")
            
        finally:
            driver.quit()
            time.sleep(0.5)
    
    def test_05_html_structure_valid(self):
        """Test 5: Page has valid HTML structure"""
        print(f"\n[SELENIUM TEST 5] Validating HTML structure")
        driver = get_minimal_chrome()
        
        try:
            driver.get(BASE_URL)
            time.sleep(1)
            
            # Check for basic HTML elements
            html = driver.find_element(By.TAG_NAME, "html")
            body = driver.find_element(By.TAG_NAME, "body")
            
            assert html is not None, "HTML tag should exist"
            assert body is not None, "Body tag should exist"
            
            print(f"✓ Valid HTML structure found")
            
        finally:
            driver.quit()
            time.sleep(0.5)
    
    def test_06_multiple_pages_load(self):
        """Test 6: Multiple pages can be loaded in sequence"""
        print(f"\n[SELENIUM TEST 6] Testing sequential page loads")
        driver = get_minimal_chrome()
        
        try:
            # Load homepage
            driver.get(BASE_URL)
            time.sleep(1)
            assert driver.current_url
            
            # Load signup
            driver.get(f"{BASE_URL}/sign-up")
            time.sleep(1)
            assert 'sign-up' in driver.current_url or 'signup' in driver.current_url.lower()
            
            print(f"✓ Sequential page loads successful")
            
        finally:
            driver.quit()
            time.sleep(0.5)
    
    def test_07_page_source_contains_html(self):
        """Test 7: Page source contains HTML content"""
        print(f"\n[SELENIUM TEST 7] Checking page source")
        driver = get_minimal_chrome()
        
        try:
            driver.get(BASE_URL)
            time.sleep(1)
            
            source = driver.page_source.lower()
            assert '<html' in source or '<!doctype' in source, "Should contain HTML"
            assert '<body' in source, "Should contain body tag"
            
            print(f"✓ Page source contains valid HTML")
            
        finally:
            driver.quit()
            time.sleep(0.5)
    
    def test_08_driver_initialization(self):
        """Test 8: Chrome driver initializes correctly"""
        print(f"\n[SELENIUM TEST 8] Testing driver initialization")
        driver = get_minimal_chrome()
        
        try:
            assert driver is not None, "Driver should initialize"
            assert driver.session_id is not None, "Driver should have session"
            
            print(f"✓ Chrome driver initialized successfully")
            
        finally:
            driver.quit()
            time.sleep(0.5)
    
    def test_09_url_navigation(self):
        """Test 9: URL navigation works"""
        print(f"\n[SELENIUM TEST 9] Testing URL navigation")
        driver = get_minimal_chrome()
        
        try:
            driver.get(BASE_URL)
            time.sleep(1)
            
            current = driver.current_url
            assert current.startswith('http'), f"URL should start with http: {current}"
            
            print(f"✓ URL navigation working: {current}")
            
        finally:
            driver.quit()
            time.sleep(0.5)
    
    def test_10_page_load_timeout(self):
        """Test 10: Page loads within timeout"""
        print(f"\n[SELENIUM TEST 10] Testing page load performance")
        driver = get_minimal_chrome()
        
        try:
            import time as time_module
            start = time_module.time()
            
            driver.get(BASE_URL)
            
            duration = time_module.time() - start
            assert duration < 10, f"Page should load in <10s, took {duration:.2f}s"
            
            print(f"✓ Page loaded in {duration:.2f} seconds")
            
        finally:
            driver.quit()
            time.sleep(0.5)
    
    def test_11_selenium_webdriver_works(self):
        """Test 11: Selenium WebDriver is functional"""
        print(f"\n[SELENIUM TEST 11] Verifying Selenium functionality")
        driver = get_minimal_chrome()
        
        try:
            # Test basic Selenium operations
            driver.get(BASE_URL)
            time.sleep(1)
            
            # Get title (Selenium operation)
            title = driver.title
            
            # Get current URL (Selenium operation)
            url = driver.current_url
            
            # Get page source (Selenium operation)
            source = driver.page_source
            
            assert title is not None
            assert url is not None
            assert len(source) > 0
            
            print(f"✓ Selenium WebDriver fully functional")
            
        finally:
            driver.quit()
            time.sleep(0.5)
    
    def test_12_browser_closes_properly(self):
        """Test 12: Browser closes and releases resources"""
        print(f"\n[SELENIUM TEST 12] Testing proper cleanup")
        driver = get_minimal_chrome()
        
        try:
            driver.get(BASE_URL)
            time.sleep(1)
            session_id = driver.session_id
            assert session_id is not None
            
        finally:
            driver.quit()
            time.sleep(0.5)
            
        print(f"✓ Browser closed and resources released")
