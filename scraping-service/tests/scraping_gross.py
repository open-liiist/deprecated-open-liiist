# https://www.gros.it/ebsn/api/category?filtered=false&hash=w0d0t0
# https://www.gros.it/ebsn/api/adv?layout=27&category_id=44968&limit=8&shuffle=false&promo=false&hash=w0d0t0

# https://www.gros.it/ebsn/api/products?parent_category_id=44979&page=2&page_size=24&sort=&promo=false&new_product=false&hash=w0d0t0
import requests
import json


def made_request(url):
	response = requests.get(url)
	if response.status_code == 200:
		return response.json()["data"]
	else:
		print(f"Error: {response.status_code}")
		return None


if __name__ == "__main__":
	# get categories
	categories_url = "https://www.gros.it/ebsn/api/category?filtered=false&hash=w0d0t0"
	categories = made_request(categories_url)

	limit = 8 # limit of products per category
	page = 1
	page_limit = 2 # stop at 2 pages


	print("Categories:", categories)
	for category in categories['categories'][:2]:
		category_id = category["categoryId"]
		cat_prods = []
		while True:
			prods_url = f"https://www.gros.it/ebsn/api/products?parent_category_id={category_id}&page={page}&page_size={limit}&sort=&promo=false&new_product=false&hash=w0d0"
			prods = made_request(prods_url)
			if prods is None:
				break
			cat_prods.extend(prods["products"])
			page += 1
			if page > page_limit:
				break
		with open(f"{category['name']}.json", "w") as outfile:
			json.dump(cat_prods, outfile, indent=4)
		print(f"{category['name']} saved")

	
	