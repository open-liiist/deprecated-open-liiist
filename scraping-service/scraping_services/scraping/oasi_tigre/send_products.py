import os
import sys
import json
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from libft import send_data_to_receiver

with open("oasi_tigre.json", "r", encoding="utf-8") as infile:
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
