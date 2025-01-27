import os
import re
import sys
import ast
import json
import requests
import pandas as pd
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))
from libft import to_float, create_store

def parse_working_hours(wh_str: str) -> str:
    """
    Tenta di convertire la stringa in JSON. Se fallisce, la lascia com'è.
    """
    try:
        wh_dict = ast.literal_eval(wh_str)
        return json.dumps(wh_dict)
    except (ValueError, SyntaxError):
        print(f"Errore parsing working_hours: {wh_str}")
        return wh_str

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
	list_shop = []
	response = requests.post(url, json=data, headers=headers)

	if response.status_code != 200:
		print(f"Error retrieving data: {response.status_code}")
		print(response.text)
		exit()

	shop_data = response.json()
	shop_info = []

	for shop in shop_data:
		info_need = shop.get("store")
		if (info_need['click_collect'] == "true") | (info_need['click_drive'] == "true") and "RM" in info_need['address']:
			match = re.search(r"\b\d{5}\b", info_need['address'])
			if match:
				postal_code = match.group(0)
			shop_info = {
				"name" : info_need['name'],
				"street": info_need['address'],
				"lat": (to_float(info_need['lat'])),
				"lng": (to_float(info_need['lon'])),
				"city": info_need['city'],
				"zip_code": postal_code,
				"working_hours": (info_need['hours']),
				"picks_up_in_shop": True,
				}
			data = ast.literal_eval(f"{info_need['hours']}")
			print("Parsed data:", data)
			list_shop.append(shop_info)
			# create_store(shop_info)
	df = pd.DataFrame(list_shop)
	df.to_csv('oasi_tigre_shop.csv', index=False)

if __name__ == "__main__":
	scraping_shop()

