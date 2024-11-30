import os
from dotenv import load_dotenv
from dotenv import dotenv_values
import time
import sys
import json
import undetected_chromedriver as uc
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from utility_tigre import categories_dict
sys.path.append('../')
from libft import wait_for_element, wait_for_elements, wait_for_elements_conad
from scraping_tigre_shop import scraping_shop
# from send_data import send_data_to_receiver

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

		if (old_price):
			right_price = old_price
			old_price = new_price
			new_price = right_price
		processed_items += 1
		product_data = {
			"full_name": name,
			"img_url": img_url,
			"description": description,
			"price": new_price,
			"discounted_price": old_price,
			"localization":
			{
				"grocery": shop['name'],
				"lat": shop['lat'],
				"long": shop['long']
			}
		}
		# send_data_to_receiver(product_data)
		product_list.append(product_data)
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

def update_env_with_dotenv(env_file, key, new_value):
	config = dotenv_values(env_file)

	config[key] = new_value

	with open(env_file, "w") as file:
		for k, v in config.items():
			file.write(f"{k}={v}\n")

if __name__ == "__main__":
	# Initialize WebDriver
	all_shop = os.environ.get("ALL_SHOP")
	count_shop = os.environ.get("COUNT_SHOP")

	shop_list = scraping_shop()
	shop_list_roma = []
	shop = []
	for shop in shop_list:
		if "RM" in shop['street']:
			shop_list_roma.append(shop)
		else:
			continue
		
	if len(shop_list_roma) != int(all_shop):
		print("Cambio nei negozi")
		exit()

	if int(count_shop) == 6:
		update_env_with_dotenv(".env", "COUNT_SHOP", 0)
		count_shop = 0
	
	count_shop = int(count_shop)

	shop = shop_list_roma[int(count_shop)]

	driver = uc.Chrome(use_subprocess=False)

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

	with open(f"product_tigre_{shop['street']}.json", "w", encoding="utf-8") as outfile:
		json.dump(product_list, outfile, indent=4)

	print(f"Total items processed: {total_items_processed}")
	
	update_env_with_dotenv(".env", "COUNT_SHOP", int(count_shop + 1))

	driver.close()