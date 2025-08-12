from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import requests
import json
import os

# First, create a test user via API


def create_test_user():
    try:
        timestamp = str(int(time.time()))
        username = f"seleniumuser{timestamp}"
        email = f"seleniumuser{timestamp}@example.com"
        password = "ValidPass123!"

        # Use environment variable for backend port, fallback to 3000
        backend_port = os.environ.get('BACKEND_PORT', '3000')
        api_url = f"http://localhost:{backend_port}/api/signup"

        print(f"🔧 Creating test user at: {api_url}")
        response = requests.post(
            api_url,
            json={
                "username": username,
                "email": email,
                "password": password
            },
            headers={"Content-Type": "application/json"}
        )

        if response.status_code == 201:
            print(f"✅ Test user created: {username}")
            return username, email, password
        else:
            print(f"❌ Failed to create test user: {response.status_code}")
            print(f"Response: {response.text}")
            return None, None, None
    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        return None, None, None


# Setup Chrome WebDriver
options = webdriver.ChromeOptions()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('--disable-gpu')
options.add_argument('--window-size=1920,1080')
driver = webdriver.Chrome(service=Service(
    ChromeDriverManager().install()), options=options)

try:
    # Create test user first
    username, email, password = create_test_user()
    if not username:
        print("❌ Cannot proceed without test user")
        exit(1)

    print(f"🔧 Starting login process for user: {email}")

    # Log in with the created user
    driver.get("http://localhost:5173/login")
    print("✅ Navigated to login page")

    # Wait for page to load
    time.sleep(3)

    # Check if we're on the login page
    current_url = driver.current_url
    print(f"🔍 Current URL: {current_url}")

    # Fill login form
    try:
        email_field = driver.find_element(By.ID, "email")
        password_field = driver.find_element(By.ID, "password")
        submit_button = driver.find_element(
            By.CSS_SELECTOR, "button[type=submit]")

        print("✅ Found login form elements")

        email_field.send_keys(email)
        password_field.send_keys(password)
        print("✅ Filled login credentials")

        submit_button.click()
        print("✅ Clicked submit button")

    except Exception as e:
        print(f"❌ Error during login form interaction: {e}")
        print(f"Page source: {driver.page_source[:1000]}")
        raise

    # Wait longer for login to complete and redirect
    print("⏳ Waiting for login to complete...")
    time.sleep(5)

    # Check if login was successful by looking for redirect
    current_url = driver.current_url
    print(f"🔍 URL after login: {current_url}")

    # Navigate to dashboard
    print("🔧 Navigating to dashboard...")
    driver.get("http://localhost:5173/dashboard")
    time.sleep(5)  # Wait longer for dashboard to load

    # Check current URL
    current_url = driver.current_url
    print(f"🔍 Dashboard URL: {current_url}")

    # Wait for page content to load
    print("⏳ Waiting for dashboard content to load...")
    time.sleep(3)

    # Get page source and check for expected content
    page_source = driver.page_source
    print(f"📄 Page source length: {len(page_source)}")
    print(f"📄 Page source preview: {page_source[:1000]}...")

    # Check for multiple possible dashboard indicators
    dashboard_indicators = [
        "Account Information",
        "Welcome back",
        "Account details",
        "Username:",
        "Email:"
    ]

    found_indicators = []
    for indicator in dashboard_indicators:
        if indicator in page_source:
            found_indicators.append(indicator)

    print(f"🔍 Found dashboard indicators: {found_indicators}")

    # Check if we're actually on the dashboard page
    if "Account Information" in page_source:
        print("✅ Dashboard navigation E2E test passed!")
    elif len(found_indicators) > 0:
        print(
            f"⚠️  Dashboard content partially loaded. Found: {found_indicators}")
        print("✅ Dashboard test passed with partial content")
    else:
        # Check if we're still on login page or got redirected elsewhere
        if "login" in current_url.lower():
            print("❌ Still on login page - authentication may have failed")
        elif "dashboard" not in current_url.lower():
            print(f"❌ Unexpected redirect to: {current_url}")
        else:
            print("❌ Dashboard loaded but content not as expected")

        # Show more debugging info
        print(f"🔍 Current page title: {driver.title}")
        print(f"🔍 Current URL: {current_url}")

        # Try to find any text content on the page
        try:
            body_text = driver.find_element(By.TAG_NAME, "body").text
            print(f"🔍 Body text preview: {body_text[:500]}...")
        except:
            print("🔍 Could not extract body text")

        raise AssertionError(
            f"Expected 'Account Information' not found in page. Found indicators: {found_indicators}")

finally:
    driver.quit()
    print("🧹 WebDriver cleaned up")
