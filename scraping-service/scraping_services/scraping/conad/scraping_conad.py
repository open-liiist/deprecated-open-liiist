import os
import re
import sys
import time
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

try:
	from libft import wait_for_element_conad, wait_for_elements_conad, update_env_with_dotenv, get_store_by_grocery_and_city, send_data_to_receiver, extract_float_from_text, read_csv_to_list_of_dicts
except ImportError:
	print("Error: libft module not found. Please ensure it's in your PYTHONPATH or in the same directory.")
	sys.exit(1)

load_dotenv()

# Finds product information on a webpage and sends it to a specified function.
# Returns: The number of products processed successfully.

def scrape_product_data(driver, shop):
	
	processed_items = 0
	time.sleep(5)

	soup = BeautifulSoup(driver.page_source, 'html.parser')
	products_container = soup.find('div', class_="product-results uk-child-width-1-1 uk-child-width-1-2@l uk-child-width-1-3@xl uk-grid")

	if not products_container:
		print("No products found on this page.")
		return 0

	product_cards = products_container.find_all('div', class_=re.compile(r"component-ProductCard"))

	# bisogna sistemare come viene presa l'immagine, se il prodotto ha lo sconto con la carta prendere il simbolo conad

	for product_card in product_cards:
		image_element = product_card.find('img')
		image_url = image_element.get('data-src') if image_element else None

		name_element = product_card.find('div', class_="no-t-decoration product-description uk-position-relative")
		name_element_h3 = name_element.find('h3') if name_element else None
		full_name = name_element_h3.get_text(strip=True) if name_element_h3 else None

		quantity_element = product_card.find('b', class_="product-quantity")
		quantity = quantity_element.get_text(strip=True) if quantity_element else None

		price_element = product_card.find('div', class_="product-price f-roboto uk-margin-auto-left")
		price_text = price_element.get_text(strip=True) if price_element else None
		
		price_per_kg_element = product_card.find('div', class_="product-price-kg")
		price_per_kg_text = price_per_kg_element.get_text(strip=True) if price_per_kg_element else None

		red_price_element = product_card.find('div', class_="product-price-red product-price f-roboto uk-margin-auto-left")
		red_price_element = red_price_element.get_text(strip=True) if red_price_element else None

		discounted_price_element = product_card.find('div', class_="product-price product-price-red f-roboto")
		discounted_price_text = discounted_price_element.get_text(strip=True) if discounted_price_element else None

		card_discount_element = product_card.find('b', class_="price sale f-roboto")
		card_discount = card_discount_element.get_text(strip=True) if card_discount_element else None

		if discounted_price_text:
			price_element = product_card.find('div', class_="product-price-original f-roboto")
			price_text = price_element.get_text(strip=True) if price_element else None
			price_per_kg_element = product_card.find('div', class_="product-price-kg override-color-red")
			price_per_kg_text = price_per_kg_element.get_text(strip=True) if price_per_kg_element else None

		if card_discount:
			discounted_price_text = card_discount

		if red_price_element:
			price_text = red_price_element

		price_per_kg = extract_float_from_text(price_per_kg_text)
		price = extract_float_from_text(price_text)
		discounted_price = extract_float_from_text(discounted_price_text)

		product_data = {
			"full_name": full_name,
			"name": full_name,
			"img_url": image_url,
			"quantity": quantity,
			"price": price,
			"price_for_kg": price_per_kg,
			"localization":
			{
				"grocery": shop['name'],
				"lat": shop['lat'],
				"lng": shop['lng'],
				"street": shop['street']
			}
		}

		if discounted_price:
			product_data['discount'] = discounted_price
		
		if all([product_data.get('full_name'), product_data.get('name'), product_data.get('price')]) and all(product_data['localization'].values()):
			send_data_to_receiver(product_data)
			processed_items += 1
		else:
			print(f"Skipping incomplete product data: {product_data}")

	return processed_items

def change_shop_location(driver, location, wait):

	driver.get("https://spesaonline.conad.it/home")
	time.sleep(5)


	wait.until(EC.visibility_of_element_located((By.ID, "onetrust-reject-all-handler")))
	driver.find_element(By.ID, "onetrust-reject-all-handler").click()
	time.sleep(2)
	form = driver.find_element(By.CLASS_NAME, "google-input")
	time.sleep(4)

	driver.execute_script("window.scrollBy(0, 200);")

	wait.until(EC.visibility_of_element_located((By.ID, "googleInputEntrypageLine1")))
	form.find_element(By.ID, "googleInputEntrypageLine1").send_keys(location)
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
	
	try:
		wait.until(EC.visibility_of_element_located((By.XPATH, '/html/body/div[34]/div[2]/iframe')))
		exit(1)
	except:
		time.sleep(30)

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

# Find all the products

if __name__ == "__main__":

	all_shop = os.environ.get("ALL_SHOP")
	count_shop = os.environ.get("COUNT_SHOP")

	result1 = get_store_by_grocery_and_city("Conad Superstore", "ROMA")
	result2 = get_store_by_grocery_and_city("Conad", "ROMA")
	result3 = get_store_by_grocery_and_city("Conad City", "ROMA")
	result4 = get_store_by_grocery_and_city("Spazio Conad", "ROMA")
	result5 = get_store_by_grocery_and_city("Conad", "GUIDONIA MONTECELIO")

	if int(count_shop) == 61:
		update_env_with_dotenv(".env", "COUNT_SHOP", 0)
		count_shop = 0
	else: 
		count_shop = int(count_shop)
	try:
		shop_list = {
			'stores': get_stores(result1) + get_stores(result2) + get_stores(result3) + get_stores(result4) + get_stores(result5)
		}
	except KeyError as e:
		print(f"Error: Missing 'stores' key in one of the result dictionaries. Error: {e}")
		shop_list = {'stores': []}

	if not shop_list['stores']:
		shop_list_csv = read_csv_to_list_of_dicts("conad_shop.csv")
		if shop_list_csv:
			try:
				shop = shop_list_csv[count_shop]
			except IndexError:
				print(f"Error: count_shop ({count_shop}) is out of range for CSV data.")
		else:
			print("Warning: conad_shop.csv is empty or could not be read.")
	else:
		try:
			shop = shop_list['stores'][count_shop]
			print(shop)
		except IndexError:
			print(f"Error: count_shop ({count_shop}) is out of range for the 'stores' list.")

	options = uc.ChromeOptions()

	options.binary_location = "/usr/bin/google-chrome"

	# options.add_argument("--headless")
	options.add_argument("--no-sandbox")
	options.add_argument("--disable-dev-shm-usage")

	# Initialize the undetected Chrome driver
	driver = uc.Chrome(options=options, use_subprocess=False)
	wait = WebDriverWait(driver, 30)

	total_items_processed = 0
	change_shop_location(driver, shop['street'], wait)

	wait.until(EC.visibility_of_element_located((By.XPATH, '/html/body/section[1]/header/div/nav[2]/ul/li[1]/a')))
	driver.find_element(By.XPATH, '/html/body/section[1]/header/div/nav[2]/ul/li[1]/a').click()
	time.sleep(3)

	soup = BeautifulSoup(driver.page_source, 'html.parser')
	macro_cat = soup.find('ul', class_="uk-nav uk-dropdown-nav catList")
	count_macro_cat = len(macro_cat.find_all('li'))

	for macro_count in range(1, count_macro_cat + 1):
		
		wait.until(EC.visibility_of_element_located((By.XPATH, f'/html/body/section[1]/header/div/nav[2]/ul/li[1]/div/div/div/div[1]/ul/li[{macro_count}]/a')))
		driver.find_element(By.XPATH, f'/html/body/section[1]/header/div/nav[2]/ul/li[1]/div/div/div/div[1]/ul/li[{macro_count}]/a').click()
		time.sleep(3)
		
		count_micro_cat = len((wait_for_elements_conad(driver, f'/html/body/section[1]/header/div/nav[2]/ul/li[1]/div/div/div/div[2]/div[{macro_count}]/ul/li')))
	
		for micro_count in range(2, count_micro_cat + 1):
			
			wait.until(EC.visibility_of_element_located((By.XPATH, f'/html/body/section[1]/header/div/nav[2]/ul/li[1]/div/div/div/div[2]/div[{macro_count}]/ul/li[{micro_count}]/a')))
			driver.find_element(By.XPATH, f'/html/body/section[1]/header/div/nav[2]/ul/li[1]/div/div/div/div[2]/div[{macro_count}]/ul/li[{micro_count}]/a').click()
			time.sleep(3)

			# c'è anche da togliere questo e sostituirlo con bs4
			if (wait_for_element_conad(driver, "/html/body/main/div/div[2]/div[2]/div[4]/section") == None):
				advertising = 4
			else:
				advertising = 5

			while True:

				total_items_processed += scrape_product_data(driver, shop)

				try:
					driver.find_element(By.XPATH, "//a[@aria-label='Pagina Successiva']").click()
				except:
					break
			
			wait.until(EC.visibility_of_element_located((By.XPATH, '/html/body/section[1]/header/div/nav[2]/ul/li[1]/a')))
			driver.find_element(By.XPATH, '/html/body/section[1]/header/div/nav[2]/ul/li[1]/a').click()
			time.sleep(3)
			wait.until(EC.visibility_of_element_located((By.XPATH, f'/html/body/section[1]/header/div/nav[2]/ul/li[1]/div/div/div/div[1]/ul/li[{macro_count}]/a')))
			driver.find_element(By.XPATH, f'/html/body/section[1]/header/div/nav[2]/ul/li[1]/div/div/div/div[1]/ul/li[{macro_count}]/a').click()
		
	print(total_items_processed)
	update_env_with_dotenv(".env", "COUNT_SHOP", int(count_shop + 1))

	driver.quit()
