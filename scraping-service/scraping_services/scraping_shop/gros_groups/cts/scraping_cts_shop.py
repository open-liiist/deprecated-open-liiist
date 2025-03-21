import os
import re
import sys
from bs4 import BeautifulSoup

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))
try:
	from libft import create_store, get_html_from_url, geocode, write_list_of_dicts_to_csv
except ImportError:
	print("Error: libft module not found. Please ensure it's in your PYTHONPATH or in the same directory.")
	sys.exit(1)

def scraping_shop():
	generic_url = "https://www.ctssupermercati.it/punti_vendita/"
	headers = {"Accept": "*/*"}

	response = get_html_from_url(generic_url, headers = headers)
	shop_name = "cts"

	shop_list = []

	soup = BeautifulSoup(response.text, 'html.parser')

	shop_div = soup.find('div', class_="jet-listing-grid__items grid-col-desk-2 grid-col-tablet-2 grid-col-mobile-1 jet-listing-grid--1789")
	if not shop_div:
		print("Shop container element not found. Website structure might have changed.")
		return
	all_shop = shop_div.find_all('div', class_=re.compile(r"jet-listing-grid__item jet-listing-dynamic-post"))
	
	for shop_class in all_shop:

		shop_info_in_class = shop_class.find_all('div', class_="jet-listing-dynamic-field__content")
		address = None
		working_hours = ""
		postal_code = None
		for shop_info in shop_info_in_class:
			if ("Indirizzo:" in shop_info.get_text()):
				address = shop_info.get_text()
				address = re.sub(r"^Indirizzo:\s*", "", address)
				match = re.search(r"\b\d{5}\b", address)
				if match:
					postal_code = match.group(0)
			elif ("Orario di apertura:" in shop_info.get_text()):
				working_hours = shop_info.get_text()
				working_hours = re.sub(r"^Orario di apertura:\s*", "", working_hours)
			elif ("Orario di apertura Domenica:" in shop_info.get_text()):
				working_hours += " " + shop_info.get_text()
				working_hours = re.sub(r" Orario di apertura Domenica:", "", working_hours)

		if not address:
			print(f"Address not found. Skipping.")
			continue
		
		if (address):
			lat, lng, city, postal = geocode({address})
			if not lat and lng:
				print(f"Geocoding failed for shop at {address}. Skipping.")
				continue
			
		shop_info = {
			"name" : shop_name,
			"street": address,
			"lat": lat,
			"lng": lng,
			"city": city,
			"working_hours": f"{working_hours}",
			"picks_up_in_shop": True,
			"zip_code": postal_code
			}
		if create_store(shop_info) is None:
			shop_list.append(shop_info)
			
	if (shop_list):
		write_list_of_dicts_to_csv(shop_list, "cts_shop.csv")

if __name__ == "__main__":
	scraping_shop()