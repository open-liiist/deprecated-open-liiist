import os
import sys
from bs4 import BeautifulSoup
import pandas as pd
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../..")))
from libft import to_float, create_store, get_html_from_url, has_phone_number, has_superficie, geocode

def scraping_shop():
	generic_url = "https://www.ctssupermercati.it/punti_vendita/"
	headers = {"Accept": "*/*"}

	response = get_html_from_url(generic_url, headers = headers)
	shop_name = "cts"

	soup = BeautifulSoup(response.text, 'html.parser')

	shop_div = soup.find('div', class_="jet-listing-grid__items grid-col-desk-2 grid-col-tablet-2 grid-col-mobile-1 jet-listing-grid--1789")
	shop_class = shop_div.find_all('div')
	for all_shop in shop_class:
		try:
			shop_info = (all_shop.find('div', class_="jet-listing-dynamic-field__content")).get_text()
			if ("Indirizzo:" in shop_info):
				print(shop_info)
			exit()
		except:
			pass
	exit()

	shop = soup.find_all('a', href=True)
	url_shop_list = []
	list_shop = []

	for shop_info in shop:
		url_shop = f"https://www.cedigros.com{shop_info['href']}"
		url_shop_list.append(url_shop)

	url_shop_list_unique = set(url_shop_list)

	for url in url_shop_list_unique:
		response = get_html_from_url((url), headers = headers)
		soup = BeautifulSoup(response.text, 'html.parser')

		try:
			div = soup.find('div', class_="fwTableCell span_7 fwPad1x mainInfos")
			div_info = div.find('h3', class_="tpl-ItemTitle text-left itemAnim")
			address = (div_info.find('small')).get_text()
			parts = div_info.contents
			city_name = parts[0].strip()

			if "GPS" in city_name:
				city_name = city_name.replace("GPS", "").strip()
		except:
			print("No location find information find")
			return None
		try:
			div = soup.find('div', class_="fwPad1x itemAnim")
			div_info = div.find_all('span', style="float:left; min-height:1.2em; line-height:1.2em")
			working_hours = []

			for div_call in div_info:
				if not (has_phone_number((div_call).get_text()) | has_superficie((div_call).get_text())):
					working_hours.append(div_call.get_text())
				else:
					pass

		except:
			print("No working hours information find")
			return None
		
		if (city_name):
			lat, lng, city, postal_code = geocode({city_name, address})
			if not lat and lng:
				print("Geocoding failed.")
				return None
			
		shop_info = {
			"name" : shop_name,
			"street": address,
			"lat": lat,
			"long": lng,
			"city": city_name,
			"working_hours": f"{working_hours}",
			"picks_up_in_shop": "True",
			"zip_code": postal_code
			}
		# create_store(shop_info)
		list_shop.append(shop_info)
	df = pd.DataFrame(list_shop)
	df.to_csv('cts_shop.csv', index=False)

if __name__ == "__main__":
	scraping_shop()