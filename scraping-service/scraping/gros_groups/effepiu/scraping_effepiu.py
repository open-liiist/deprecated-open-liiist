import os
import re
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from libft import to_float, fetch_data, extract_micro_categories, send_data_to_receiver, get_store_by_grocery_and_city

if __name__ == "__main__":
	categories_url = "https://www.ctsspesaonline.it/ebsn/api/category?filtered=false&hash=w0d0t0"
	headers = {"Accept": "*/*"}

	categories = fetch_data(categories_url, headers)
	max_pages = 1000

	micro_categories = extract_micro_categories(categories)

	shop_list = get_store_by_grocery_and_city("idromarket", "Roma")
	  
	allowed_keywords = ["ITALIA", "SCOTTONA", "ALLEVATO"]
	all_product = []

	for category in micro_categories:
		category_id = category["categoryId"]
		products = []
		page = 1

		while True:
			products_url = f"https://www.ctsspesaonline.it/ebsn/api/products?parent_category_id={category_id}&page={page}&page_size=24"
			fetched_products = fetch_data(products_url, headers)

			if fetched_products is None or len(fetched_products["products"]) == 0:
				break

			products.extend(fetched_products["products"])
			page += 1

			if page > max_pages:
				break
		
		for product in products:
			try:
				product_data = {
				"full_name": product['name'],
				"img_url": f"{'https://www.ctsspesaonline.it'}{product['mediaURLMedium']}",
				"quantity": product['description'],
				"price": product['price'],
				}

				if product['priceDisplay'] != product['price']:
					product_data["discounted_price"] = product['priceDisplay']

				if product_data["quantity"] == "":
					try:
						product_data["quantity"] = f"{product['productInfos']['WEIGHT_SELLING']}{product['productInfos']['WEIGHT_UNIT_SELLING']}"
					except:
						product_data["quantity"] = f"1 {product['priceUnitDisplay']}"
				else:
					try:
						product_data["price_for_kg"] = product['priceUmDisplay']
					except:
						product_data["price_for_kg"] = product['priceDisplay']
					
				if any(keyword in product_data['quantity'] for keyword in allowed_keywords) and not re.search(r'\d', product_data['quantity']):
					if "ITALIA" in product_data['quantity'] or "ALLEVATO" in product_data['quantity']:
						product_data['quantity'] = f"{product['productInfos']['WEIGHT_SELLING']}{product['productInfos']['WEIGHT_UNIT_SELLING']}"
						product_data['description'] = product['description']
					if "SCOTTONA" in product_data['quantity']:
						product_data['quantity'] = f"{product['productInfos']['WEIGHT_SELLING']}{product['productInfos']['WEIGHT_UNIT_SELLING']}"
						product_data['description'] = product['shortDescr']
						product_data['full_name'] = f"{product['name']} {product['description']}"

				for shop in shop_list:
					product_data["localization"] = {
					"grocery": shop['grocery'],
					"lat": shop['lat'],
					"long": shop['lng']
				}
					send_data_to_receiver(product_data)


			except Exception as e:
				print(f"{product['name']}: {e}")
				print(f"{product['id']}")
				pass