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
	url = "https://www.cedigros.com/insegne/itemlist/filter.html?category=26&moduleId=219&Itemid=701&abb249e6156b7eea4b28c92fb743caa0=1&format=raw"
	headers = {"Accept": "*/*"}
	response = get_html_from_url(url, headers = headers)

	soup = BeautifulSoup(response.text, 'html.parser')
	# shop = soup.find_all('small')
	# for address in shop:
	# 	print(address.get_text())
	city = soup.find_all('h5')
	for city_name in city:
		print(city_name.get_text())
	