# https://spesaonline.conad.it/c/level2/_jcr_content/root/search.loader.html/frutta-fresca--0101.html?page=2
# https://spesaonline.conad.it/c/level2/_jcr_content/root/search.loader.html/%7Bcategory%7D.html?page=1
from bs4 import BeautifulSoup
import requests
import json


def send_request(url):
	response = requests.get(url)
	if response.status_code == 200:
		return response.text
	else:
		print(f"Error: {response.status_code}")
		return None

def extract_product_info(product_card):
	# Extract the product JSON from the 'data-product' attribute
	# FIND CLASS product-img
	try:
		title = product_card.find('div', class_='product-description')
		url = product_card.find('div', class_='product-img').find("img")["data-src"]
		product_url = product_card.find('a', class_='product')['href']
		quantity = product_card.find('b', class_='product-quantity')
		if quantity:
			quantity = quantity.text.strip()
		if title:
			title = title.find('h3').text.strip()



		print(f"Image URL: {url}, Title: {title}")
	except AttributeError as e:
		print("Error: Unable to extract product information. could be a Sponsored card product.", e)
def parse_html(html):

	soup = BeautifulSoup(html, 'html.parser')

	products = []
	product_cards = soup.find_all('div', class_='component-ProductCard')
	all_products = [extract_product_info(card) for card in product_cards]
	print(f"Found {len(all_products)} products.")
	return products

if __name__ == "__main__":
	url = "https://spesaonline.conad.it/c/level2/_jcr_content/root/search.loader.html/--0101.html?page=2"
	html = send_request(url)
	if html:
		with open("/home/ripa/Ecole42/grocygo/scraping-service/tests/raw/conad_html.html", "w") as outfile:
			outfile.write(html)
		products = parse_html(html)
		# Save the extracted products to a file or process them further as needed
		with open("products.json", "w") as outfile:
			json.dump(products, outfile, indent=4)
	else:
		print("Failed to retrieve HTML content.")
	# You can also send the extracted products to a data-receiver service
	# send_data_to_receiver(products)
	# ...
	# ...
	# ...
	# You can also implement pagination or other features to improve efficiency and scalability
	#...

