# https://www.gros.it/ebsn/api/category?filtered=false&hash=w0d0t0
# https://www.gros.it/ebsn/api/adv?layout=27&category_id=44968&limit=8&shuffle=false&promo=false&hash=w0d0t0

# https://www.gros.it/ebsn/api/products?parent_category_id=44979&page=2&page_size=24&sort=&promo=false&new_product=false&hash=w0d0t0
import requests
import json


def made_request(url):
	response = requests.get(url, headers = {
		"Accept": "*/*"
	})
	if response.status_code == 200:
		return response.json()["data"]
	else:
		print(f"Error: {response.status_code}")
		return None

if __name__ == "__main__":
	# get categories
	categories_url = "https://www.gros.it/ebsn/api/category?filtered=false&hash=w0d0t0"
	response = requests.get(categories_url)
	categories = response.json()["data"]

	limit = 15 # limit of products per category
	page = 1
	page_limit = 100000 # stop at 2 pages
	micro_cate = []

	for category in categories["categories"]:
		categories_tmp = categories
		if "categories" not in categories_tmp:
			micro_cate.append(category)
		for cat in category["categories"]:
			if "categories" not in cat:
				micro_cate.append(cat)
			else:
				micro_cate.extend(cat["categories"])
	# print("Micro_cate:", micro_cate)
	for category in micro_cate:
		category_id = category["categoryId"]
		cat_prods = []
		page = 1
		while True:
			prods_url = f"https://www.gros.it/ebsn/api/products?parent_category_id={category_id}&page={page}&page_size=24"
			print(f"https://www.gros.it/ebsn/api/products?parent_category_id={category_id}&page={page}&page_size=24")
			prods = made_request(prods_url)
			if prods is None or len(prods["products"]) == 0:
				break
			cat_prods.extend(prods["products"])
			page += 1
			if page > page_limit:
				break
		with open(f"{category['name']}.json", "w") as outfile:
			json.dump(cat_prods, outfile, indent=4)
		# print(f"{category['name']} saved")

	
	