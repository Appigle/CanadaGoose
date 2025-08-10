from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time
import requests
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

    driver.get("http://localhost:5173/login")
    # Hide Vue DevTools overlays
    driver.execute_script('''
      var style = document.createElement('style');
      style.innerHTML = '.vue-devtools__anchor-btn, .vue-devtools__panel { display: none !important; }';
      document.head.appendChild(style);
    ''')
    time.sleep(1)

    # Fill out the login form
    driver.find_element(By.ID, "email").send_keys(email)
    driver.find_element(By.ID, "password").send_keys(password)
    driver.find_element(By.CSS_SELECTOR, "button[type=submit]").click()

    # Wait for redirect and check if we're on dashboard
    time.sleep(3)

    # Check if login was successful by looking for dashboard content
    current_url = driver.current_url
    page_source = driver.page_source

    # Login should redirect to dashboard, so check for dashboard content
    if "dashboard" in current_url:
        # We're on dashboard, check for dashboard content
        assert "Account Information" in page_source, "Dashboard page loaded but 'Account Information' not found"
        print("Login E2E test passed! Successfully redirected to dashboard.")
    else:
        # Still on login page, check for error or success
        print(f"Current URL: {current_url}")
        print(f"Page source preview: {page_source[:300]}...")
        assert False, "Login failed - not redirected to dashboard"

finally:
    driver.quit()
