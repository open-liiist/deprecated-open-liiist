import json
import requests
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains

# Waits for a single element to appear on the page.
# Returns: The WebElement if found, otherwise None.

def wait_for_element(driver, xpath, max_retries=3, retry_delay=5):
	
	for i in range(max_retries):
		try:
			element = WebDriverWait(driver, 10).until(
				EC.presence_of_element_located((By.XPATH, xpath))
			)
			if element:
				return element
			else:
				print(f"Element not found within 10 seconds: {xpath}")
				time.sleep(retry_delay)
		except Exception as e:
			print(f"Error finding element: {xpath}: {e}")
			time.sleep(retry_delay)

	print(f"Failed to find element in {xpath} after {max_retries} retries.")
	sys.exit(1)
	return None

# Waits for multiple elements to appear on the page
# Returns: A list of WebElements if found, otherwise an empty list

def wait_for_elements(driver, xpath, max_retries=3, retry_delay=5):

	for i in range(max_retries):
		try:
			elements = driver.find_elements(By.XPATH, xpath)
			if elements:
				return elements
			else:
				print(f"No elements found in: {xpath}")
				time.sleep(retry_delay)
		except Exception as e:
			print(f"Error finding elements in: {xpath}: {e}")
			time.sleep(retry_delay)

	print(f"Failed to find elements in {xpath} after {max_retries} retries.")
	sys.exit(1)
	return []

# Fetches JSON data from a URL
# Returns: The parsed JSON data if successful, otherwise None

def fetch_data(url, headers):

	response = requests.get(url, headers = headers)
	if response.status_code == 200:
		return response.json()["data"]
	else:
		print(f"Error: {response.status_code}")
		return None

# Extracts all micro categories from a nested category structure
# Returns: A list of micro categories

def extract_micro_categories(categories):

	micro_categories = []

	for category in categories["categories"]:
		categories_tmp = categories
		if "categories" not in categories_tmp:
			micro_categories.append(category)
		for cat in category["categories"]:
			if "categories" not in cat:
				micro_categories.append(cat)
			else:
				micro_categories.extend(cat["categories"])

	return micro_categories

def extract_micro_categories(categories):

	micro_categories = []

	def extract_micro_categories_recursive(category):
		if "categories" not in category:
			micro_categories.append(category)
		else:
			for sub_category in category["categories"]:
				extract_micro_categories_recursive(sub_category)

	for category in categories["categories"]:
		extract_micro_categories_recursive(category)

	return micro_categories