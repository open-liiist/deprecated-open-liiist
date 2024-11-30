import json
import requests

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
	
	response = requests.post(url, json=body_data, headers=headers)

	if response.status_code != 200:
		print(f"Error retrieving data: {response.status_code}")
		print(response.text)
		exit()

	shop_data = response.json()['data']['orderAndCollect']
	all_shop = shop_data['pointOfServices']
	shop_list = []

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
	with open(f"store_conad.json", "w", encoding="utf-8") as outfile:
		json.dump(shop_list, outfile, indent=4)
		
	return(shop_list)

if __name__ == "__main__":
	scraping_shops()