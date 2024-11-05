import time
import sys
import undetected_chromedriver as uc
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from libft import wait_for_element, wait_for_elements

# Finds and processes information from product cards in a micro category
# Returns: The number of processed items

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

def find_and_send_info(driver, n_cards):

	# active = 1
	processed_items = 0
	card_selector = f''

	for card in range(1, n_cards + 1):
		card_xpath = card_selector.format(card=card)

		try:
			# Scroll to a line of product
			element = wait_for_element(driver, f"/html/body/main/div/div[2]/div[2]/div[4]/div[{card + 1}]")
			driver.execute_script('arguments[0].scrollIntoView(true)', element)
		except:
			pass
		try:
			name = wait_for_element(driver,f'/html/body/main/div/div[2]/div[2]/div[4]/div[{card + 1}]/div/div[1]/div[1]/div[2]/a/div[2]/h3').text
			image_element = wait_for_element(driver, f'/html/body/main/div/div[2]/div[2]/div[4]/div[{card + 1}]/div/div[1]/div[1]/div[2]/a/div[1]/img')
			img_url = image_element.get_attribute("src")
			quantity = wait_for_element(driver, f'/html/body/main/div/div[2]/div[2]/div[4]/div[{card + 1}]/div/div[1]/div[1]/div[2]/div[1]/div[1]/b').text
			price = wait_for_element(driver, f'/html/body/main/div/div[2]/div[2]/div[4]/div[{card + 1}]/div/div[1]/div[1]/div[2]/div[1]/div[3]').text
			price_kg = wait_for_element(driver, f'/html/body/main/div/div[2]/div[2]/div[4]/div[1{card + 1}]/div/div[1]/div[1]/div[2]/div[1]/div[1]/div').text
			processed_items += 1
		except:
			pass
			# name = wait_for_element(driver,f'').text
			# image_element = wait_for_element(driver, f'/')
			# img_url = image_element.get_attribute("src")
			# quantity = wait_for_element(driver, f'').text
			# price = wait_for_element(driver, f'').text
			# print(name, description, quantity, price)
		
		print(name, quantity, price, price_kg, '\n')

	return processed_items

# Find only the products without a discount

if __name__ == "__main__":

	# instantiate a Chrome browser
	driver = uc.Chrome(
		use_subprocess=False,
	)

	total_items_processed = 0
	driver.get("https://spesaonline.conad.it/home")
	time.sleep(5)

	wait = WebDriverWait(driver, 10)

	wait.until(EC.visibility_of_element_located((By.ID, "onetrust-reject-all-handler")))
	driver.find_element(By.ID, "onetrust-reject-all-handler").click()
	# time.sleep(2)
	form = driver.find_element(By.CLASS_NAME, "google-input")

	wait.until(EC.visibility_of_element_located((By.ID, "googleInputEntrypageLine1")))
	form.find_element(By.ID, "googleInputEntrypageLine1").send_keys("Milano")
	time.sleep(2)

	wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "submitButton")))
	form.find_element(By.CLASS_NAME, "submitButton").click()

	wait.until(EC.visibility_of_element_located((By.XPATH, '//*[@id="ordina-e-ritira"]/div/div/button')))
	driver.find_element(By.XPATH, '//*[@id="ordina-e-ritira"]/div/div/button').click()
	time.sleep(2)

	wait.until(EC.visibility_of_element_located((By.XPATH, '//*[@id="ordina-ritira-scelta-pdv"]/div[2]/div/div[1]/div/ul/li[1]/div')))
	driver.find_element(By.XPATH, '//*[@id="ordina-ritira-scelta-pdv"]/div[2]/div/div[1]/div/ul/li[1]/div').click()
	time.sleep(2)

	wait.until(EC.visibility_of_element_located((By.XPATH, '//*[@id="modal-onboarding-wrapper"]/div[2]/div[5]/button')))
	driver.find_element(By.XPATH, '//*[@id="modal-onboarding-wrapper"]/div[2]/div[5]/button').click()
	time.sleep(60)

	driver.get("https://spesaonline.conad.it/c/--0101")
	time.sleep(5)

	n_cards = len(wait_for_elements(driver, '//*[@id="#top"]/div/div[2]/div[2]/div[4]/div'))
	for card in range(n_cards + 1):
				total_items_processed = find_and_send_info(driver, n_cards)
	
	print(total_items_processed)
	time.sleep(100)
	driver.quit()
