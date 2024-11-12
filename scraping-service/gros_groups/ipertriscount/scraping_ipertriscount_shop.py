import sys
import requests
from bs4 import BeautifulSoup
sys.path.append('../')

# Fetches the HTML content from a given URL.
# Returns: The HTML content of the page, or None if an error occurs.

def get_html_from_url(url, headers):

	try:
		response = requests.get(url, headers = headers)
		response.raise_for_status()
		return response.text
	except requests.exceptions.RequestException as e:
		print(f"Error fetching URL: {e}")
		return None

if __name__ == "__main__":
	url = "https://www.cedigros.com/insegne/itemlist/filter.html?category=26&moduleId=219&Itemid=701&abb249e6156b7eea4b28c92fb743caa0=1&format=raw"
	headers = {"Accept": "*/*"}
	html_content = get_html_from_url(url, headers)

	if html_content:
		soup = BeautifulSoup(html_content, 'html.parser')
		print(soup.preatti)