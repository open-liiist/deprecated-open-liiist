import os
import sys
import json
import requests
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from libft import to_float, create_store

def scraping_shop():
	# Declaration of all information that request.post needs to function correctly

	url = "https://storegabrielli.retailtune.com/store/locator.php"
	user_data = {
		"latitude": 42.8528624,
		"longitude": 13.5389759,
		"lang": "it",
		"radius": 200000
	}
	data = {"user": user_data}
	headers = {"Accept": "*/*"}

	response = requests.post(url, json=data, headers=headers)

	if response.status_code != 200:
		print(f"Error retrieving data: {response.status_code}")
		print(response.text)
		exit()

	shop_data = response.json()

	for shop in shop_data:
		info_need = shop.get("store")

		if (info_need['click_collect'] == "true") | (info_need['click_drive'] == "true") and "RM" in info_need['address']:
			shop_info = {
				"name" : info_need['name'],
				"lat": (to_float(info_need['lat'])),
				"long": (to_float(info_need['lon'])),
				"street": info_need['address'],
				"city": info_need['city'],
				"working_hours": (f"{info_need['hours']}"),
				"picks_up_in_shop": True,
				}

			create_store(shop_info)


if __name__ == "__main__":
	scraping_shop()

