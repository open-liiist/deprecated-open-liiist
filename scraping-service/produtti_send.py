import os
import sys
import time
import json
import logging
import requests
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from libft import send_data_to_receiver, create_store

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

PRODUCT_RECEIVER_BASE_URL = os.getenv('PRODUCT_RECEIVER_BASE_URL', 'http://product-receiver-service:3002')

def reand_and_send(file_json):
	with open(file_json, "r", encoding="utf-8") as infile:
		data_info = json.load(infile)

	if isinstance(data_info, list):
		shop_list = data_info  # Assign directly if data is already a list
	else:
		shop_list = [data_info]  # Wrap data in a list if it's not a list

	for shop in shop_list:
		product_data = {
					"name": shop['name'],
					"full_name": shop['full_name'],
					"img_url": shop['img_url'],
					"description": shop['description'],
					"price": shop['price'],
					"discount": shop['discount'],
					"localization":
					{
						"grocery": shop['localization']['grocery'],
						"lat": shop['localization']['lat'],
						"long": shop['localization']['long']
					}
				}
		send_data_to_receiver(product_data)
		time.sleep(1)

def reand_and_send_shop(file_json):
	with open(file_json, "r", encoding="utf-8") as infile:
		data_info = json.load(infile)

	if isinstance(data_info, list):
		shop_list = data_info  # Assign directly if data is already a list
	else:
		shop_list = [data_info]  # Wrap data in a list if it's not a list

	for shop in shop_list:
		shop_data = {
					"name": shop['name'],
					"street": shop['street'],
					"lat": shop['lat'],
					"long": shop['long'],
					"city": shop['city'],
					"working_hours": shop['working_hours'],
					"picks_up_in_shop": shop['picks_up_in_shop'],
					"zip_code": None
				}
		try:
			shop_data["zip_code"] = shop['zip_code']
		except:
			pass
		create_store(shop_data)
		time.sleep(1)

if __name__ == "__main__":

	logging.info(f"Waiting 30 seconds...")
	time.sleep(30)
	logging.info(f"Waiting completed")
	reand_and_send_shop("oasi_tigre_shop.json")
	reand_and_send("all_oasi_tigre.json")

	reand_and_send_shop("all_gros_shop.json")
	reand_and_send("all_gros.json")