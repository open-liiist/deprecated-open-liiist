# https://www.ipertriscount.it/ebsn/api/category?filtered=false&hash=w0d0t0
# https://www.ipertriscount.it/ebsn/api/adv?layout=27&category_id=44968&limit=8&shuffle=false&promo=false&hash=w0d0t0

# https://www.ipertriscount.it/ebsn/api/products?parent_category_id=44979&page=2&page_size=24&sort=&promo=false&new_product=false&hash=w0d0t0
import requests
import json
import sys
sys.path.append('../')
# from send_data import send_data_to_receiver
from libft import fetch_data, extract_micro_categories


if __name__ == "__main__":
	categories_url = "https://www.ipertriscount.it/ebsn/api/category?filtered=false&hash=w0d0t0"
	headers = {"Accept": "*/*"}
	categories = fetch_data(categories_url, headers)

	micro_categories = extract_micro_categories(categories)
	shop_info = 

	for category in micro_categories:
		category_id = category["categoryId"]
		products = []
		page = 1

		while True:
			products_url = f"https://www.ipertriscount.it/ebsn/api/products?parent_category_id={category_id}&page={page}&page_size=24"
			print(products_url)

			fetched_products = fetch_data(products_url, headers)
			if fetched_products is None or len(fetched_products["products"]) == 0:
				break

			products.extend(fetched_products["products"])
			page += 1
			if page > max_pages:
				break
		product_data = []
		for shop in shop_info:
			for product in products:
				product_data = {
				"full_name": product['name'],
				"img_url": f"{'https://www.ipertriscount.it'}{product['mediaURLMedium']}",
				"description": product['description'],
				"quantity": f"{product['unitMeasureBase']['umId']} {product['unitMeasureBase']['um']}",
				"price_for_kg": product['price'],
				"discounted_price": product['priceDisplay'],
				# "localization":
				# {
				# 	"grocery": "",
				#	"lat": ,
				#	"long": 
				# }
			}
				# send_data_to_receiver(product_data)
				print(product_data)