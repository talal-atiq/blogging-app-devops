"""
WebDriver Setup Utility for Headless Chrome
Configures Chrome WebDriver for automated testing in EC2 environment
"""

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import os


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
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--disable-extensions')
        chrome_options.add_argument('--disable-software-rasterizer')
    
    # Additional options for stability
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    # Initialize the driver
    try:
        # Try using ChromeDriverManager first
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
    except Exception as e:
        print(f"ChromeDriverManager failed: {e}")
        # Fallback to system chromedriver
        driver = webdriver.Chrome(options=chrome_options)
    
    # Set implicit wait
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
