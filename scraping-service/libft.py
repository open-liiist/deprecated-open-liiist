import sys
import json
import time
import requests
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import TimeoutException

# Waits for a single element to appear on the page.
# Returns: The WebElement if found, otherwise None.

# This function is use for the conad site, because in some case it search for a thing that doesn't exist

def wait_for_element_conad(driver, xpath, max_retries=2, retry_delay=2):

	for i in range(max_retries):
		try:
			element = WebDriverWait(driver, 3).until(
				EC.presence_of_element_located((By.XPATH, xpath))
			)
			return element
		except TimeoutException as e:
			time.sleep(retry_delay)
			print("1")
			pass
		except NoSuchElementException as e:
			time.sleep(retry_delay)
			print("2")
			pass
		except ElementNotVisibleException as e:
			time.sleep(retry_delay)
			print("3")
			pass
		except Exception as e:
			time.sleep(retry_delay)
			print("6")
			pass

	return None

def wait_for_element(driver, xpath, max_retries=3, retry_delay=5):

	for i in range(max_retries):
		try:
			element = WebDriverWait(driver, 10).until(
				EC.presence_of_element_located((By.XPATH, xpath))
			)
			return element
		except (NoSuchElementException, TimeoutException) as e:
			print(f"Error finding element: {xpath} (Retry {i+1}/{max_retries}): {e}")
			time.sleep(retry_delay)

	print(f"Failed to find element in {xpath} after {max_retries} retries.")
	return None

# Waits for multiple elements to appear on the page
# Returns: A list of WebElements if found, otherwise an empty list

def wait_for_elements_conad(driver, xpath, max_retries=2, retry_delay=2):

	for i in range(max_retries):
		try:
			element = WebDriverWait(driver, 3).until(
				EC.presence_of_element_located((By.XPATH, xpath))
			)
			return element
		except Exception as e:
			time.sleep(retry_delay)
			pass

	return None

def wait_for_elements(driver, xpath, max_retries=3, retry_delay=5):

	for i in range(max_retries):
		try:
			elements = WebDriverWait(driver, 10).until(
				EC.presence_of_all_elements_located((By.XPATH, xpath))
			)
			return elements
		except (NoSuchElementException, TimeoutException) as e:
			print(f"Error finding elements: {xpath} (Retry {i+1}/{max_retries}): {e}")
			time.sleep(retry_delay)

	print(f"Failed to find elements in {xpath} after {max_retries} retries.")
	return None

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

	def extract_micro_categories_recursive(category):
		
		if "categories" not in category:
			yield category
		else:
			for sub_category in category["categories"]:
				yield from extract_micro_categories_recursive(sub_category)

	return list(extract_micro_categories_recursive(categories))
