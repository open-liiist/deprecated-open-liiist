import sys
import requests
from bs4 import BeautifulSoup
sys.path.append('../')

# Fetches the HTML content from a given URL.
# Returns: The HTML content of the page, or None if an error occurs.

def get_html_from_url(url, headers):

	try:
		response = requests.get(url, headers = headers)
		return response
	except:
		if response.status_code != 200:
			print('Request failed:', response.status_code)
			exit()

if __name__ == "__main__":
	generic_url = "https://www.cedigros.com/insegne/itemlist/filter.html?category=26&moduleId=219&Itemid=701&abb249e6156b7eea4b28c92fb743caa0=1&format=raw"
	headers = {"Accept": "*/*"}
	response = get_html_from_url(generic_url, headers = headers)

	soup = BeautifulSoup(response.text, 'html.parser')
	shop = soup.find_all('a', href=True)
	url_shop_list = []
	for shop_info in shop:
		url_shop = f"https://www.cedigros.com{shop_info['href']}"
		url_shop_list.append(url_shop)
	url_shop_list_unique = set(url_shop_list)
	for url in url_shop_list_unique:
		response = get_html_from_url((url), headers = headers)
		soup = BeautifulSoup(response.text, 'html.parser')
		print(soup.prettify())
		
		
		# address = shop_info.find('small')
		# parts = shop_info.contents
		# city_name = parts[0].strip()
		# print(city_name)
		# print(address.get_text())