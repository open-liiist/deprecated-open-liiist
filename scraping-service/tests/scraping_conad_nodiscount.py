import time
import sys
import undetected_chromedriver as uc
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Manages the search in the page

def wait_for_element(driver, xpath):
	try:
		return WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, xpath)))
	except Exception as e:
		print("Element not found within 10 seconds:", e)
		driver.close()
		sys.exit()

def wait_for_elements(driver, xpath):
	try:
		elements = driver.find_elements(By.XPATH, xpath)
		if not elements:
			print("No elements found in:" + xpath)
			return []
		else:
			return(elements)
	except Exception as e:
		print("An error occurred:", e)
		driver.close()
		sys.exit()

# Find all the information that we need for a specific micro_category

def find_and_send_info(driver, n_cards, k):
	for card in range(1, n_cards + 1):
		try:
			name = wait_for_element(driver,f'').text
			image_element = wait_for_element(driver, f'/')
			img_url = image_element.get_attribute("src")
			quantity = wait_for_element(driver, f'').text
			price = wait_for_element(driver, f'').text
			print(name, description, quantity, price)
		except:
			pass

# Find only the products without a discount

if __name__ == "__main__":

	# instantiate a Chrome browser
	driver = uc.Chrome(
		use_subprocess=False,
	)

	driver.get("https://spesaonline.conad.it/home")
	time.sleep(1)
	driver.find_element(By.ID, "onetrust-reject-all-handler").click()
	# time.sleep(2)
	form = driver.find_element(By.CLASS_NAME, "google-input")
	form.find_element(By.ID, "googleInputEntrypageLine1").send_keys("Milano")
	time.sleep(2)
	form.find_element(By.CLASS_NAME, "submitButton").click()
	time.sleep(2)
	driver.find_element(By.XPATH, '//*[@id="ordina-e-ritira"]/div/div/button').click()
	time.sleep(2)
	driver.find_element(By.XPATH, '//*[@id="ordina-ritira-scelta-pdv"]/div[2]/div/div[1]/div/ul/li[1]/div').click()
	time.sleep(2)
	driver.find_element(By.XPATH, '//*[@id="modal-onboarding-wrapper"]/div[2]/div[5]/button').click()
	time.sleep(10)
	driver.get("https://spesaonline.conad.it/c/--0102")
	time.sleep(2)
	for category, items in categories_dict.items():
		for item in items:
			driver.get(f"url")
			time.sleep(5)
			n_micro_cate = len(wait_for_elements(driver, '/html/body/main/div[1]/div[2]/div[2]/div'))
			micro_cate = wait_for_elements(driver, 'xpath')
			for micro_cate in range(1, n_micro_cate)
				n_cards = len(wait_for_elements(driver, '//*[@id="#top"]/div/div[2]/div[2]/div[4]/div'))
				find_and_send_info(driver, n_cards, k)
		
	time.sleep(100)
	driver.quit()

	# 	products = []
	# for card in range(n_cards + 1):
	# 	try:
	# 		title = driver.find_element(By.XPATH, f'//*[@id="#top"]/div/div[2]/div[2]/div[4]/div[{card + 1}]/div/div[1]/div[1]/div[2]/a/div[2]/h3').text
	# 		product_price = driver.find_element(By.XPATH, f'//*[@id="#top"]/div/div[2]/div[2]/div[4]/div[{card + 1}]/div/div[1]/div[1]/div[2]/div[1]/div[3]').text
	# 		quantity = driver.find_element(By.XPATH, f'//*[@id="#top"]/div/div[2]/div[2]/div[4]/div[{card + 1}]/div/div[1]/div[1]/div[2]/div[1]/div[1]/b').text
	# 		product = {
	# 			"title": title,
    #             "price": product_price,
	# 			"quantity": quantity
	# 		}
			
	# 		print(f"Product title: {title} {product_price} {quantity}")
	# 	except Exception as e:
	# 		print(f"Error could be due to a promo card or a different layout.")