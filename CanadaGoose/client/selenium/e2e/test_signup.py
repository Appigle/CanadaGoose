from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

# Setup Chrome WebDriver
options = webdriver.ChromeOptions()
options.add_argument('--headless')  # Run in headless mode
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
driver = webdriver.Chrome(service=Service(
    ChromeDriverManager().install()), options=options)

try:
    driver.get("http://localhost:5173/signup")
    # Hide Vue DevTools overlays
    driver.execute_script('''
      var style = document.createElement('style');
      style.innerHTML = `
        .vue-devtools__anchor-btn,
        .vue-devtools__panel {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    ''')
    time.sleep(1)

    # Generate unique username and email
    timestamp = str(int(time.time()))
    username = f"seleniumuser{timestamp}"
    email = f"seleniumuser{timestamp}@example.com"

    # Fill out the signup form
    driver.find_element(By.ID, "username").send_keys(username)
    driver.find_element(By.ID, "email").send_keys(email)
    driver.find_element(By.ID, "password").send_keys("ValidPass123!")
    driver.find_element(By.ID, "confirmPassword").send_keys("ValidPass123!")
    driver.find_element(By.CSS_SELECTOR, "button[type=submit]").click()

    # Wait for redirect and check if signup was successful
    time.sleep(3)

    # Check if signup was successful by looking for dashboard content
    current_url = driver.current_url
    page_source = driver.page_source

    # Signup should redirect to dashboard, so check for dashboard content
    if "dashboard" in current_url:
        # We're on dashboard, check for dashboard content
        assert "Account Information" in page_source, "Dashboard page loaded but 'Account Information' not found"
        print(
            f"Signup E2E test passed! Successfully created account for {username} and redirected to dashboard.")
    else:
        # Still on signup page, check for error or success
        print(f"Current URL: {current_url}")
        print(f"Page source preview: {page_source[:300]}...")
        assert False, "Signup failed - not redirected to dashboard"

finally:
    driver.quit()
