from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Waits for a single element to appear on the page.
# Returns: The WebElement if found, otherwise None.

def wait_for_element(driver, xpath):

	try:
		element = WebDriverWait(driver, 10).until(
			EC.presence_of_element_located((By.XPATH, xpath))
		)
		if not element:
			print(f"Element not found within 10 seconds: {xpath}")
			return None
		return element
	except Exception as e:
		print(f"Error finding element: {e}")
		driver.quit()
		sys.exit()

# Waits for multiple elements to appear on the page
# Returns: A list of WebElements if found, otherwise an empty list

def wait_for_elements(driver, xpath):

	try:
		elements = driver.find_elements(By.XPATH, xpath)
		if not elements:
			print(f"No elements found in: {xpath}")
			return []
		return elements
	except Exception as e:
		print(f"Error finding elements: {e}")
		driver.quit()
		sys.exit()