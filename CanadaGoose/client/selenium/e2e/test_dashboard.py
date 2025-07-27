from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

options = webdriver.ChromeOptions()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
driver = webdriver.Chrome(service=Service(
    ChromeDriverManager().install()), options=options)

try:
    # Log in first
    driver.get("http://localhost:5173/login")
    driver.execute_script('''
      var style = document.createElement('style');
      style.innerHTML = '.vue-devtools__anchor-btn, .vue-devtools__panel { display: none !important; }';
      document.head.appendChild(style);
    ''')
    time.sleep(2)
    driver.find_element(By.ID, "email").send_keys("seleniumuser@example.com")
    driver.find_element(By.ID, "password").send_keys("ValidPass123!")
    driver.find_element(By.CSS_SELECTOR, "button[type=submit]").click()
    time.sleep(2)

    # Navigate to dashboard (should be redirected or accessible)
    driver.get("http://localhost:5173/dashboard")
    time.sleep(1)
    assert "Dashboard" in driver.page_source or "Account Information" in driver.page_source
    print("Dashboard navigation E2E test passed!")
finally:
    driver.quit()
