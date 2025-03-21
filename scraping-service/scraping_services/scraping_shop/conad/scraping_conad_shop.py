import os
import sys
import requests

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))
try:
	from libft import create_store, write_list_of_dicts_to_csv
except ImportError:
	print("Error: libft module not found. Please ensure it's in your PYTHONPATH or in the same directory.")
	sys.exit(1)

def scraping_shops():
	# Declaration of all information that request.post needs to function correctly

	url = "https://spesaonline.conad.it/api/ecommerce/it-it.stores.json"
	body_data = {
		"latitudine": 41.8967068,
		"longitudine": 12.4822025,
		"typeOfService": "ORDER_AND_COLLECT",
		"partial": True
	}
	headers = {"Accept": "*/*"}

	shop_list = []
	
	response = requests.post(url, json=body_data, headers=headers)

	if response.status_code != 200:
		print(f"Error retrieving data: {response.status_code}")
		print(response.text)
		exit()

	shop_data = response.json()['data']['orderAndCollect']
	all_shop = shop_data['pointOfServices']

	for info_need in all_shop:
		shop_info = {
			"name": info_need['storeType'],
			"street": info_need['address']['formattedAddress'],
			"lat": info_need['geoPoint']['latitude'],
			"lng": info_need['geoPoint']['longitude'],
			"city": info_need['address']['town'],
			"zip_code": info_need['address']['postalCode'],
			"picks_up_in_shop": True,
		}

		if 'serviceHours' in info_need:
			if len(info_need['serviceHours']) == 1:
				shop_info['working_hours'] = info_need['serviceHours'][0]
			else:
				service_hours = " ".join(info_need['serviceHours'])
				shop_info['working_hours'] = service_hours
		if create_store(shop_info) is None:
			shop_list.append(shop_info)
			
	if (shop_list):
		write_list_of_dicts_to_csv(shop_list, "conad_shop.csv")

if __name__ == "__main__":
	scraping_shops()