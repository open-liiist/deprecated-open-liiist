import os
import sys
import time
import json
from dotenv import load_dotenv
from dotenv import dotenv_values
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from utility_tigre import categories_dict
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from libft import wait_for_element, wait_for_elements, wait_for_elements_conad, update_env_with_dotenv, to_float, send_data_to_receiver, get_store_by_grocery_and_city

load_dotenv()

def wait_fw(driver, xpath):

	try:
		elements = WebDriverWait(driver, 7).until(
			EC.presence_of_all_elements_located((By.XPATH, xpath))
		)
		return elements
	except Exception as e:
		return None

# Finds and processes information from product cards in a micro category
# Returns: The number of processed items

def find_and_send_info(driver, n_cards, micro_cate, shop, product_list):

	active = 1
	processed_items = 0
	card_selector = f'/html/body/main/div[1]/div[2]/div[2]/div[{micro_cate}]/div/div[2]/div/div/div[1]/div[{{card}}]'

	for card in range(1, n_cards + 1):
		card_xpath = card_selector.format(card=card)

		name = wait_for_element(driver, f"{card_xpath}/div/div[3]/div[2]/h4").text
		image_element = wait_for_element(driver, f"{card_xpath}/div/div[3]/div[1]/a/img")
		img_url = image_element.get_attribute("src")
		description = wait_for_element(driver, f"{card_xpath}/div/div[3]/div[3]/p").text
		new_price = wait_for_element(driver, f"{card_xpath}/div/div[4]/div[1]/div[2]/p").text
		old_price = wait_for_element(driver, f"{card_xpath}/div/div[4]/div[1]/div[1]/p").text

		if "KG" in old_price:
			price_for_kg = to_float(old_price)
		else:
			price_for_kg = 0.0

		if old_price:
			old_price, new_price = new_price, old_price

		old_price = to_float(old_price)
		new_price = to_float(new_price)

		processed_items += 1
		product_data = {
			"name": name,
			"full_name": name,
			"img_url": img_url,
			"description": description,
			"price": new_price,
			"discount": old_price,
			"localization":
			{
				"grocery": shop['grocery'],
				"lat": shop['lat'],
				"long": shop['lng']
			}
		}
		product_data["price_for_kg"] = price_for_kg
		

		send_data_to_receiver(product_data)
		# product_list.append(product_data)
		
		if active == 1:
			try:
				wait_for_element(driver, f"/html/body/main/div[1]/div[2]/div[2]/div[{micro_cate}]/div/div[2]/div/div/div[3]").click()
			except:
				active = 0

	return processed_items

# Selects the first Oasi Tigre store in a given location.

def change_shop_location(driver, location):

	wait = WebDriverWait(driver, 10)

	driver.get("https://oasitigre.it/it/spesa.html")

	button1 = wait.until(EC.element_to_be_clickable((By.XPATH, "/html/body/main/div[1]/div[2]/div[1]/div/div/button[1]")))
	button1.click()
	time.sleep(4)

	wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input.form-control.pdv.pac-target-input")))
	input_box = driver.find_element(By.CSS_SELECTOR, "input.form-control.pdv.pac-target-input")
	input_box.click()
	input_box.send_keys(location)
	time.sleep(5)
	input_box.send_keys(Keys.ENTER)
	time.sleep(7)

	wait.until(EC.visibility_of_element_located((By.XPATH, "//div[@class='shop-card-container']/div[@class='card-selezione-negozio']")))
	available_shops = driver.find_elements(By.XPATH, "//div[@class='shop-card-container']/div[@class='card-selezione-negozio']")

	if len(available_shops) == 0:
		print('No shops found')
		return

	available_shops[0].click()
	time.sleep(5)
	button2 = wait.until(EC.element_to_be_clickable((By.XPATH, "/html/body/div[4]/div[2]/div[3]/div[3]/div[8]/button")))
	button2.click()
	time.sleep(4)

if __name__ == "__main__":
	all_shop = os.environ.get("ALL_SHOP")
	count_shop = os.environ.get("COUNT_SHOP")

	result1 = get_store_by_grocery_and_city("Supermercato Tigre", "Roma")
	result2 = get_store_by_grocery_and_city("Supermercato Tigre", "Ciampino")

	shop_list = {'stores': result1['stores'] + result2['stores']}

	if int(count_shop) == 6:
		update_env_with_dotenv(".env", "COUNT_SHOP", 0)
		count_shop = 0

	count_shop = int(count_shop)

	shop = shop_list['stores'][count_shop]

	options = uc.ChromeOptions()

	options.binary_location = "/usr/bin/google-chrome"

	options.add_argument("--headless")
	options.add_argument("--no-sandbox")
	options.add_argument("--disable-dev-shm-usage")

	# Initialize the undetected Chrome driver
	driver = uc.Chrome(options=options, use_subprocess=False)
	total_items_processed = 0
	product_list = []
	change_shop_location(driver, shop['street'])

	for category, items in categories_dict.items():
		count = 0
		for item in items:
			product_url = f"https://oasitigre.it/it/spesa/reparti/{category}/{item}.html"

			driver.get(product_url)
			time.sleep(5)

			n_micro_cate = len(wait_fw(driver, '/html/body/main/div[1]/div[2]/div[2]/div'))
			active = 1

			for micro_cate in range(2, n_micro_cate + 1):
				if active == 1:
					try:
						element = wait_for_element(driver, f"/html/body/main/div[1]/div[2]/div[2]/div[{micro_cate}]")
						driver.execute_script('arguments[0].scrollIntoView(true)', element)
					except:
						active = 0

				try:
					n_cards = len(wait_fw(driver, f'/html/body/main/div[1]/div[2]/div[2]/div[{micro_cate}]/div/div[2]/div/div/div[1]/div'))
				except:
					print("sono qui")
					continue

				total_items_processed += find_and_send_info(driver, n_cards, micro_cate, shop, product_list)

	print(f"Total items processed: {total_items_processed}")
	
	update_env_with_dotenv(".env", "COUNT_SHOP", int(count_shop + 1))

	driver.close()