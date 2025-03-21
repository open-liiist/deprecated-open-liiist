import os
import re
import sys
from requests.exceptions import RequestException

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

try:
	from libft import fetch_data, extract_micro_categories, send_data_to_receiver, get_store_by_grocery_and_city, read_csv_to_list_of_dicts
except ImportError:
	print("Error: libft module not found. Please ensure it's in your PYTHONPATH or in the same directory.")
	sys.exit(1)

if __name__ == "__main__":
	categories_url = "https://www.ipertriscountspesaonline.it/ebsn/api/category?filtered=false&hash=w0d0t0"
	headers = {"Accept": "*/*"}
	max_pages = 1000
	allowed_keywords = ["ITALIA", "SCOTTONA", "ALLEVATO"]

	try:
		categories = fetch_data(categories_url, headers)
		micro_categories = extract_micro_categories(categories)

		shop_list = get_store_by_grocery_and_city("ipertriscount", "Roma")
		if (shop_list == None):
			shop_list = read_csv_to_list_of_dicts("ipertriscount_shop.csv")

		for category in micro_categories:
			category_id = category["categoryId"]
			page = 1

			while page <= max_pages:
				products_url = f"https://www.ipertriscountspesaonline.it/ebsn/api/products?parent_category_id={category_id}&page={page}&page_size=24"
				try:
					fetched_products = fetch_data(products_url, headers)
				except RequestException as e:
					print(f"Error fetching products from {products_url}: {e}")
					break

				if not fetched_products or not fetched_products.get("products"):
					break

				for product in fetched_products["products"]:
					try:
						product_data = {
							"name": product.get('name'),
							"full_name": product.get('name'),
							"img_url": f"https://www.ipertriscountspesaonline.it{product.get('mediaURLMedium', '')}",
							"quantity": product.get('description'),
							"price": product.get('price'),
						}
						if product['priceDisplay'] != product['price']:
							product_data["discounted_price"] = product['priceDisplay']

						product_infos = product.get("productInfos", {})

						if product_data["quantity"] == "":
							try:
								product_data["quantity"] = f"{product_infos['WEIGHT_SELLING']}{product_infos['WEIGHT_UNIT_SELLING']}"
							except:
								product_data["quantity"] = f"1 {product['priceUnitDisplay']}"
						else:
							try:
								product_data["price_for_kg"] = product['priceUmDisplay']
							except:
								product_data["price_for_kg"] = product['priceDisplay']
						
						if any(keyword in product_data['quantity'] for keyword in allowed_keywords) and not re.search(r'\d', product_data['quantity']):
							if "ITALIA" in product_data['quantity'] or "ALLEVATO" in product_data['quantity']:
								product_data['quantity'] = f"{product_infos.get('WEIGHT_SELLING')}{product_infos.get('WEIGHT_UNIT_SELLING')}"
								product_data['description'] = product.get('description')
							if "SCOTTONA" in product_data['quantity']:
								product_data['quantity'] = f"{product_infos.get('WEIGHT_SELLING')}{product_infos.get('WEIGHT_UNIT_SELLING')}"
								product_data['description'] = product.get('shortDescr')
								product_data['full_name'] = f"{product.get('name')} {product.get('description')}"

						if not product_data.get('full_name') or not product_data.get('name') or not product_data.get('price'):
							continue

						for shop in shop_list:
							product_data_send = product_data.copy()
							product_data_send["localization"] = {
								"grocery": shop.get('name'),
								"lat": shop.get('lat'),
								"lng": shop.get('lng'),
								"street": shop.get('street'),
							}
							if not (product_data.get('grocery') or not product_data.get('lat') or not product_data.get('lng')):
								continue
							send_data_to_receiver(product_data_send)

					except (KeyError, TypeError) as e:
						print(f"Error processing product {product.get('name', 'ID Missing')}: {e}")
						continue

				page += 1

	except (RequestException, FileNotFoundError) as e:
		print(f"A top-level error occurred: {e}")
		sys.exit(1)
