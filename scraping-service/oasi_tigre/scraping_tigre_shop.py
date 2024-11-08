# https://storegabrielli.retailtune.com/store/locator.php

import requests
import json

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

# Save the requests.post call in object containing information about the HTTP response
response = requests.post(url, json=data, headers=headers)

# Check for successful response in case not print and exit
if response.status_code != 200:
	print(f"Error retrieving data: {response.status_code}")
	print(response.text)
	exit()

# Parse the JSON response into a Python dictionary
shop_data = response.json()

file_counter = 0

# Loop through each shop information in the response
for shop in shop_data:
	store_info = shop.get("store")
	
	# Open the file in write mode with proper indentation
	with open(f"store{file_counter}.json", "w", encoding="utf-8") as outfile:
		json.dump(store_info, outfile, indent=4)

	file_counter += 1

print(f"Successfully saved {file_counter} store data files.")