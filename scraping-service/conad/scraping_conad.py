
import time
import sys
import undetected_chromedriver as uc
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
sys.path.append('../')
from libft import wait_for_element, wait_for_elements, wait_for_element_conad
# from send_data import send_data_to_receiver

# Finds product information on a webpage and sends it to a specified function.
# Returns: The number of products processed successfully.
 
def find_and_send_info(driver, n_cards, advertising):

	processed_items = 0
	card_selector = f"/html/body/main/div/div[2]/div[2]/div[({advertising})]/div[{{card_index}}]" 

	for card_index in range(1, n_cards + 1):
		flag = 0
		card_xpath = card_selector.format(card_index=card_index)

		card_element = wait_for_element(driver, card_xpath)
		driver.execute_script("arguments[0].scrollIntoView(true)", card_element)

		product_data = {
			"full_name": wait_for_element(driver, f"{card_xpath}/div/div[1]/div[1]/div[2]/a/div[2]/h3").text,
			"img_url": (wait_for_element(driver, f"{card_xpath}/div/div[1]/div[1]/div[2]/a/div[1]/img")).get_attribute("src"),
			"quantity": wait_for_element(driver, f"{card_xpath}/div/div[1]/div[1]/div[2]/div[1]/div[1]/b").text,
			"price": (wait_for_element_conad(driver, f"{card_xpath}/div/div[1]/div[1]/div[2]/div[1]/div[3]").text),
			"price_for_kg": wait_for_element(driver, f"{card_xpath}/div/div[1]/div[1]/div[2]/div[1]/div[1]/div").text,
			"discounted_price": None,
			"localization":
		{
			"grocery": "conad",
			# "lat": ,
			# "long": 
		}
		}
		if (product_data["price"] == None):
			product_data["discounted_price"] = wait_for_element_conad(driver, f"{card_xpath}/div/div[1]/div[1]/div[2]/div[1]/div[2]/div[2]").text
			product_data["discounted_price"] = wait_for_element_conad(driver, f"{card_xpath}/div/div[1]/div[1]/div[2]/div[1]/div[2]/div[2]").text
		if (wait_for_element_conad(driver, f"{card_xpath}/div/div[1]/div[1]/div[2]/div[2]/div/span") != None):
			product_data["discounted_price"] = wait_for_element_conad(driver, f"{card_xpath}/div/div[1]/div[1]/div[2]/div[2]/div/span/b[2]").text
		processed_items += 1

		print(product_data, "\n")
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
	time.sleep(2)
	form = driver.find_element(By.CLASS_NAME, "google-input")
	time.sleep(4)

	driver.execute_script("window.scrollBy(0, 200);")

	wait.until(EC.visibility_of_element_located((By.ID, "googleInputEntrypageLine1")))
	form.find_element(By.ID, "googleInputEntrypageLine1").send_keys("Roma")
	time.sleep(4)

	wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "submitButton")))
	form.find_element(By.CLASS_NAME, "submitButton").click()

	wait.until(EC.visibility_of_element_located((By.XPATH, '//*[@id="ordina-e-ritira"]/div/div/button')))
	driver.find_element(By.XPATH, '//*[@id="ordina-e-ritira"]/div/div/button').click()
	time.sleep(4)

	wait.until(EC.visibility_of_element_located((By.XPATH, '//*[@id="ordina-ritira-scelta-pdv"]/div[2]/div/div[1]/div/ul/li[1]/div')))
	driver.find_element(By.XPATH, '//*[@id="ordina-ritira-scelta-pdv"]/div[2]/div/div[1]/div/ul/li[1]/div').click()
	time.sleep(4)

	wait.until(EC.visibility_of_element_located((By.XPATH, '//*[@id="modal-onboarding-wrapper"]/div[2]/div[5]/button')))
	driver.find_element(By.XPATH, '//*[@id="modal-onboarding-wrapper"]/div[2]/div[5]/button').click()
	# /html/body/div[34]/div[2]/iframe captha 
	time.sleep(60)

	driver.get("https://spesaonline.conad.it/c/--0101")
	time.sleep(5)

	if (wait_for_element(driver, "/html/body/main/div/div[2]/div[2]/div[4]/section") == None):
		advertising = 4
	else:
		advertising = 5

	count_pages = len((wait_for_elements(driver, f'/html/body/main/div/div[2]/div[2]/div[{advertising + 1}]/ul/li')))
	if (count_pages > 1):
		n_pages = (wait_for_element(driver, f'/html/body/main/div/div[2]/div[2]/div[{advertising + 1}]/ul/li[{count_pages - 1}]')).text
	else:
		n_pages = 1
	for page in range(2, int(n_pages) + 1):
				n_cards = len(wait_for_elements(driver, f'//*[@id="#top"]/div/div[2]/div[2]/div[{advertising}]/div'))
				total_items_processed = find_and_send_info(driver, n_cards, advertising)
				time_click = driver.find_element(By.XPATH, f'/html/body/main/div/div[2]/div[2]/div[{advertising + 1}]/ul/li[{page}]/a').click()
				time.sleep(4)
				break
	
	print(total_items_processed)
	time.sleep(100)
	driver.quit()
