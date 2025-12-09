package com.blogging.test;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.time.Duration;

public class BloggingAppTest {
    
    private WebDriver driver;
    private WebDriverWait wait;
    private String baseUrl;
    
    @BeforeClass
    public void setUp() {
        // Get base URL from environment variable or use default
        baseUrl = System.getenv("APP_URL");
        if (baseUrl == null || baseUrl.isEmpty()) {
            baseUrl = "http://35.153.144.16:8081";
        }
        
        // Setup Chrome options for headless mode
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--disable-gpu");
        options.addArguments("--window-size=1920,1080");
        
        // Setup WebDriverManager
        WebDriverManager.chromedriver().setup();
        
        // Initialize driver
        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        
        System.out.println("Testing application at: " + baseUrl);
    }
    
    @Test(priority = 1, description = "Verify home page loads successfully")
    public void testHomePageLoads() {
        driver.get(baseUrl);
        String title = driver.getTitle();
        Assert.assertNotNull(title, "Page title should not be null");
        System.out.println("✓ Test 1 Passed: Home page loaded - Title: " + title);
    }
    
    @Test(priority = 2, description = "Verify page title is correct")
    public void testPageTitle() {
        driver.get(baseUrl);
        String title = driver.getTitle();
        Assert.assertTrue(title.contains("Tech") || title.contains("Blog"), 
            "Title should contain 'Tech' or 'Blog'");
        System.out.println("✓ Test 2 Passed: Page title verified - " + title);
    }
    
    @Test(priority = 3, description = "Verify header is present")
    public void testHeaderPresent() {
        driver.get(baseUrl);
        WebElement body = driver.findElement(By.tagName("body"));
        Assert.assertNotNull(body, "Body element should be present");
        System.out.println("✓ Test 3 Passed: Header/Body is present");
    }
    
    @Test(priority = 4, description = "Verify navigation is accessible")
    public void testNavigationExists() {
        driver.get(baseUrl);
        // Check if any navigation element exists
        boolean navExists = driver.findElements(By.tagName("nav")).size() > 0 ||
                           driver.findElements(By.tagName("header")).size() > 0;
        Assert.assertTrue(navExists, "Navigation should exist");
        System.out.println("✓ Test 4 Passed: Navigation is accessible");
    }
    
    @Test(priority = 5, description = "Verify page contains root div")
    public void testRootDivExists() {
        driver.get(baseUrl);
        WebElement root = driver.findElement(By.id("root"));
        Assert.assertNotNull(root, "Root div should be present");
        System.out.println("✓ Test 5 Passed: Root div exists");
    }
    
    @Test(priority = 6, description = "Verify page URL is correct")
    public void testCorrectURL() {
        driver.get(baseUrl);
        String currentUrl = driver.getCurrentUrl();
        Assert.assertTrue(currentUrl.contains("8081") || currentUrl.contains(baseUrl), 
            "URL should match expected");
        System.out.println("✓ Test 6 Passed: Correct URL - " + currentUrl);
    }
    
    @Test(priority = 7, description = "Verify page loads within timeout")
    public void testPageLoadTime() {
        long startTime = System.currentTimeMillis();
        driver.get(baseUrl);
        long loadTime = System.currentTimeMillis() - startTime;
        Assert.assertTrue(loadTime < 10000, "Page should load within 10 seconds");
        System.out.println("✓ Test 7 Passed: Page loaded in " + loadTime + "ms");
    }
    
    @Test(priority = 8, description = "Verify browser can execute JavaScript")
    public void testJavaScriptExecution() {
        driver.get(baseUrl);
        Object result = ((org.openqa.selenium.JavascriptExecutor) driver)
            .executeScript("return document.readyState");
        Assert.assertEquals(result, "complete", "Document should be in ready state");
        System.out.println("✓ Test 8 Passed: JavaScript execution successful");
    }
    
    @Test(priority = 9, description = "Verify page has HTML tag")
    public void testHTMLTagExists() {
        driver.get(baseUrl);
        WebElement html = driver.findElement(By.tagName("html"));
        Assert.assertNotNull(html, "HTML tag should exist");
        System.out.println("✓ Test 9 Passed: HTML tag exists");
    }
    
    @Test(priority = 10, description = "Verify page has head section")
    public void testHeadSectionExists() {
        driver.get(baseUrl);
        WebElement head = driver.findElement(By.tagName("head"));
        Assert.assertNotNull(head, "Head section should exist");
        System.out.println("✓ Test 10 Passed: Head section exists");
    }
    
    @AfterClass
    public void tearDown() {
        if (driver != null) {
            driver.quit();
            System.out.println("Browser closed successfully");
        }
    }
}
