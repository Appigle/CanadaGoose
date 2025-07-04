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

    # Fill out the signup form
    driver.find_element(By.ID, "username").send_keys(
        "seleniumuser" + str(time.time()))
    driver.find_element(By.ID, "email").send_keys(
        "seleniumuser" + str(time.time()) + "@example.com")
    driver.find_element(By.ID, "password").send_keys("ValidPass123!")
    driver.find_element(By.ID, "confirmPassword").send_keys("ValidPass123!")
    driver.find_element(By.CSS_SELECTOR, "button[type=submit]").click()

    # Wait for redirect or success message
    time.sleep(2)
    assert "dashboard" in driver.current_url or "Account created" in driver.page_source
    print("Signup E2E test passed!")
finally:
    driver.quit()
