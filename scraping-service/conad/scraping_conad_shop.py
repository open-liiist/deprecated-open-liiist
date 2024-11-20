# https://spesaonline.conad.it/api/ecommerce/it-it.stores.json

import requests
import json

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

	# Save the requests.post call in object containing information about the HTTP response

	response = requests.post(url, json=body_data, headers=headers)

	# Check for successful response in case not print and exit

	if response.status_code != 200:
		print(f"Error retrieving data: {response.status_code}")
		print(response.text)
		exit()


	# Parse the JSON response into a Python dictionary

	shop_data = response.json()['data']['orderAndCollect']
	all_shop = shop_data['pointOfServices']
	shop_list = []

	# Loop through each shop information in the response

	for info_need in all_shop:
		shop_info = {
			"name": info_need['storeType'],
			"street": info_need['address']['formattedAddress'],
			"lat": info_need['geoPoint']['latitude'],
			"long": info_need['geoPoint']['longitude'],
			"city": info_need['address']['town'],
			"zip_code": info_need['address']['postalCode'],
		}

		if 'serviceHours' in info_need:
			if len(info_need['serviceHours']) == 1:
				shop_info['working_hours'] = info_need['serviceHours'][0]
			else:
				service_hours = " ".join(info_need['serviceHours'])
				shop_info['working_hours'] = service_hours
		shop_list.append(shop_info)
	# print(shop_list)
	# return(shop_list)

if __name__ == "__main__":
	scraping_shops()