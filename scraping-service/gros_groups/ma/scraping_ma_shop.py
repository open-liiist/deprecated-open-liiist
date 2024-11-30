import sys
import json
from bs4 import BeautifulSoup
sys.path.append('../')
from libft_gros import get_html_from_url, has_phone_number, has_superficie, geocode
# from send_data import create_store

def scraping_shop():
	generic_url = "https://www.cedigros.com/insegne/itemlist/filter.html?category=39&moduleId=219&Itemid=701&f63b37307b7737ac4a3515d3d0455523=1&format=raw"
	headers = {"Accept": "*/*"}
	
	response = get_html_from_url(generic_url, headers = headers)
	shop_info_list = []
	shop_name = "ma"

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
		shop_info_list.append(shop_info)
	
	# with open(f"store_ma.json", "w", encoding="utf-8") as outfile:
	# 	json.dump(shop_info_list, outfile, indent=4)
	return shop_info_list

if __name__ == "__main__":
	scraping_shop()