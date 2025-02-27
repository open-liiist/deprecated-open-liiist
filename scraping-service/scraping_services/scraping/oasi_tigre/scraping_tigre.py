import os
import re
import sys
import time
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from utility_tigre import categories_dict
try:
	from libft import update_env_with_dotenv, send_data_to_receiver, get_store_by_grocery_and_city, extract_float_from_text, read_csv_to_list_of_dicts
except ImportError:
	print("Error: libft module not found. Please ensure it's in your PYTHONPATH or in the same directory.")
	sys.exit(1)

load_dotenv()

# Finds and processes information from product cards in a micro category
# Returns: The number of processed items

def find_and_send_info(shop, products_contenir):

	processed_items = 0
	
	if not products_contenir:
		print("No products found on this page.")
		return 0

	product_cards = products_contenir.find_all('div', class_=re.compile(r"swiper-slide product-card"))

	for product_card in product_cards:

		image_element = product_card.find('img')
		image_url = image_element.get('src') if image_element else None

		name_element = product_card.find('a', class_="product-link product-link-title")
		full_name = name_element.get_text(strip=True) if name_element else None

		price_element = product_card.find('div', class_="newPrice")
		price_text = price_element.get_text(strip=True) if price_element else None

		discounted_price_element = product_card.find('div', class_="oldPrice")
		discounted_price_text = discounted_price_element.get_text(strip=True) if discounted_price_element else None

		description_element = product_card.find('div', class_="productSubTitle")
		description = description_element.get_text(strip=True) if description_element else None

		price = extract_float_from_text(price_text)
		discounted_price = extract_float_from_text(discounted_price_text)
		
		if "KG" in price_text:
			price_for_kg = price
		else:
			price_for_kg = 0

		if discounted_price_text:
			discounted_price, price = price, discounted_price
			if "KG" in discounted_price_text:
				price_for_kg = discounted_price
		else:
			discounted_price = 0

		
		product_data = {
			"name": full_name,
			"full_name": full_name,
			"img_url": image_url,
			"price": price,
			"localization":
			{
				"grocery": shop['name'],
				"lat": shop['lat'],
				"lng": shop['lng'],
				"street": shop['street']
			}
		}

		if description_element:
			product_data["description"] = description
		if price_for_kg:
			product_data["price_for_kg"] = price_for_kg
		if discounted_price:
			product_data["discount"] = discounted_price

		if all([product_data.get('full_name'), product_data.get('name'), product_data.get('price')]) and all(product_data['localization'].values()):
			send_data_to_receiver(product_data)
			processed_items += 1
		else:
			print(f"Skipping incomplete product data: {product_data}")

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

def get_stores(result_dict):
	"""Helper function to safely get 'stores' from a result dictionary."""
	if result_dict is None:
		return []
	try:
		stores = result_dict['stores']
		if stores is None:
			return []
		return stores
	except KeyError:
		return []

if __name__ == "__main__":

	all_shop = os.environ.get("ALL_SHOP_2")
	count_shop = os.environ.get("COUNT_SHOP_2")

	result1 = get_store_by_grocery_and_city("Supermercato Tigre", "Roma")
	result2 = get_store_by_grocery_and_city("Supermercato Tigre", "Ciampino")

	if int(count_shop) == int(all_shop):
		update_env_with_dotenv(".env", "COUNT_SHOP", 0)
		count_shop = 0
	else: 
		count_shop = int(count_shop)
	try:
		shop_list = {
			'stores': get_stores(result1) + get_stores(result2)
		}
	except KeyError as e:
		print(f"Error: Missing 'stores' key in one of the result dictionaries. Error: {e}")
		shop_list = {'stores': []}

	if not shop_list['stores']:
		shop_list_csv = read_csv_to_list_of_dicts("oasi_tigre_shop.csv")
		if shop_list_csv:
			try:
				shop = shop_list_csv[count_shop]
			except IndexError:
				print(f"Error: count_shop ({count_shop}) is out of range for CSV data.")
		else:
			print("Warning: oasi_tigre_shop.csv is empty or could not be read.")
	else:
		try:
			shop = shop_list['stores'][count_shop]
			print(shop)
		except IndexError:
			print(f"Error: count_shop ({count_shop}) is out of range for the 'stores' list.")

	options = uc.ChromeOptions()

	options.binary_location = "/usr/bin/google-chrome"

	options.add_argument("--headless")
	options.add_argument("--no-sandbox")
	options.add_argument("--disable-dev-shm-usage")

	# Initialize the undetected Chrome driver
	driver = uc.Chrome(options=options, use_subprocess=False)
	total_items_processed = 0

	change_shop_location(driver, shop['street'])

	for category, items in categories_dict.items():
		for item in items:
			
			product_url = f"https://oasitigre.it/it/spesa/reparti/{category}/{item}.html"

			driver.get(product_url)
			time.sleep(5)

			soup = BeautifulSoup(driver.page_source, 'html.parser')
			all_products_contenir = soup.find_all('div', class_="aggregatore-prodotti js-aggregatore-cont")
			
			for products_contenir in all_products_contenir:

				total_items_processed += find_and_send_info(shop, products_contenir)

	print(f"Total items processed: {total_items_processed}")
	
	update_env_with_dotenv(".env", "COUNT_SHOP_2", int(count_shop + 1))

	driver.close()