"""
WebDriver Setup Utility for Headless Chrome
Configures Chrome Web Driver for automated testing in EC2 environment
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options


def get_chrome_driver(headless=True):
    """
    Initialize and return a Chrome WebDriver instance
    
    Args:
        headless (bool): Whether to run Chrome in headless mode
        
    Returns:
        webdriver.Chrome: Configured Chrome WebDriver instance
    """
    chrome_options = Options()
    
    if headless:
        chrome_options.add_argument('--headless=new')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=800,600')
        chrome_options.add_argument('--disable-extensions')
        chrome_options.add_argument('--disable-software-rasterizer')
    
    # Memory optimization options
    chrome_options.add_argument('--disable-background-networking')
    chrome_options.add_argument('--disable-default-apps')
    chrome_options.add_argument('--disable-sync')
    chrome_options.add_argument('--mute-audio')
    chrome_options.add_argument('--no-first-run')
    
    # Additional options for stability
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    # Use system chromedriver (pre-installed in Docker)
    driver = webdriver.Chrome(options=chrome_options)
    
    # Set timeouts
    driver.set_page_load_timeout(30)
    driver.implicitly_wait(10)
    
    return driver


def close_driver(driver):
    """
    Safely close the WebDriver instance
    
    Args:
        driver: WebDriver instance to close
    """
    if driver:
        try:
            driver.quit()
        except Exception as e:
            print(f"Error closing driver: {e}")
