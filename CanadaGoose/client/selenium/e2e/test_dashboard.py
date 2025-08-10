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
driver = webdriver.Chrome(service=Service(
    ChromeDriverManager().install()), options=options)

try:
    # Create test user first
    username, email, password = create_test_user()
    if not username:
        print("❌ Cannot proceed without test user")
        exit(1)

    # Log in with the created user
    driver.get("http://localhost:5173/login")
    driver.execute_script('''
      var style = document.createElement('style');
      style.innerHTML = '.vue-devtools__anchor-btn, .vue-devtools__panel { display: none !important; }';
      document.head.appendChild(style);
    ''')
    time.sleep(2)

    # Fill login form
    driver.find_element(By.ID, "email").send_keys(email)
    driver.find_element(By.ID, "password").send_keys(password)
    driver.find_element(By.CSS_SELECTOR, "button[type=submit]").click()
    time.sleep(3)  # Wait longer for login to complete

    # Navigate to dashboard
    driver.get("http://localhost:5173/dashboard")
    time.sleep(2)  # Wait for dashboard to load

    # Check for dashboard content - the dashboard shows "Account Information"
    page_source = driver.page_source
    print(f"Page source preview: {page_source[:500]}...")

    # Check for expected content
    assert "Account Information" in page_source, f"Expected 'Account Information' not found in page. Found: {page_source[:200]}"
    print("Dashboard navigation E2E test passed!")

finally:
    driver.quit()
