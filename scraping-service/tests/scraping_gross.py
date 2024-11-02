# https://www.gros.it/ebsn/api/category?filtered=false&hash=w0d0t0
# https://www.gros.it/ebsn/api/adv?layout=27&category_id=44968&limit=8&shuffle=false&promo=false&hash=w0d0t0

# https://www.gros.it/ebsn/api/products?parent_category_id=44979&page=2&page_size=24&sort=&promo=false&new_product=false&hash=w0d0t0
import requests
import json

# Fetches JSON data from a URL
# Returns: The parsed JSON data if successful, otherwise None

def fetch_data(url, headers):

	response = requests.get(url, headers = headers)
	if response.status_code == 200:
		return response.json()["data"]
	else:
		print(f"Error: {response.status_code}")
		return None

# Extracts all micro categories from a nested category structure
# Returns: A list of micro categories

def extract_micro_categories(categories):

	micro_categories = []

	for category in categories["categories"]:
		categories_tmp = categories
		if "categories" not in categories_tmp:
			micro_cate.append(category)
		for cat in category["categories"]:
			if "categories" not in cat:
				micro_categories.append(cat)
			else:
				micro_categories.extend(cat["categories"])

	return micro_categories

if __name__ == "__main__":
	# Get categories
	categories_url = "https://www.gros.it/ebsn/api/category?filtered=false&hash=w0d0t0"
	headers = {"Accept": "*/*"}
	categories = fetch_data(categories_url, headers)

	limit_per_category = 15
	max_pages = 100000

	micro_categories = extract_micro_categories(categories)

	for category in micro_categories:
		category_id = category["categoryId"]
		products = []
		page = 1

		while True:
			products_url = f"https://www.gros.it/ebsn/api/products?parent_category_id={category_id}&page={page}&page_size=24"
			print(products_url)

			fetched_products = fetch_data(products_url)
			if fetched_products is None or len(fetched_products["products"]) == 0:
				break

			products.extend(fetched_products["products"])
			page += 1
			if page > max_pages:
				break

		with open(f"{category['name']}.json", "w") as outfile:
			json.dump(products, outfile, indent=4)
		print(f"{category['name']} saved")