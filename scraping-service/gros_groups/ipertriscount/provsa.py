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
	generic_url = "https://www.cedigros.com/insegne/ipertriscount/79/via-don-primo-mazzolari-181.html"
	headers = {"Accept": "*/*"}
	response = get_html_from_url(generic_url, headers = headers)
	soup = BeautifulSoup(response.text, 'html.parser')
	try:
		div = soup.find('div', class_="fwTableCell span_7 fwPad1x mainInfos")
		div_info = div.find('h3', class_="tpl-ItemTitle text-left itemAnim")
		address = div_info.find('small')
		parts = div_info.contents
		city_name = parts[0].strip()
		print(city_name)
		print(address.get_text())
	except:
		print("No location find information find")
	try:
		div = soup.find('div', class_="fwPad1x itemAnim")
		div_info = div.find_all('span', style="float:left; min-height:1.2em; line-height:1.2em")
		for div_call in div_info:
			print(div_call.text)
		# address = div_info.find('small')
		# parts = div_info.contents
		# city_name = parts[0].strip()
		# print(city_name)
		# print(address.get_text())
	except:
		print("No working hours information find")