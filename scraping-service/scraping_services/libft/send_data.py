import os
import requests
from dotenv import load_dotenv

load_dotenv()

PRODUCT_RECEIVER_BASE_URL = os.getenv('PRODUCT_RECEIVER_BASE_URL', 'https://mongodb-atlas-pied.vercel.app')

def send_data_to_receiver(product):
	"""Creates a new product with provided data."""
	base_url = PRODUCT_RECEIVER_BASE_URL
	url = f'{base_url}/api/insertOne'
	send_data = {
		"databaseName": "codex",
		"collectionName": "liiistProduct",
		"data": product
	}

	try:
		response = requests.post(url, json=send_data)
		if response.status_code == 200:
			print(f"Product sent successfully: {send_data['data']['name']}")
		else:
			print(f"Failed to send {send_data['data']['name']}. Error: {response.status_code} and {response.json()}")
	except requests.exceptions.RequestException as e:
		print(f"An error occurred while sending {send_data['data']['name']}: {e}")

def create_store(store):
	"""Creates a new store with provided data."""
	base_url = PRODUCT_RECEIVER_BASE_URL
	url = f'{base_url}/api/insertOne'
	send_data = {
		"databaseName": "codex",
		"collectionName": "liiistStore",
		"data": store
	}

	try:
		response = requests.post(url, json=send_data)
		if response.status_code == 200:
			print(f"Store created successfully: {send_data['data']['name']}")
			return response.json()
		else:
			print(f"Failed to create {send_data['data']['name']}. Error: {response.status_code}")
			return None
	except requests.exceptions.RequestException as e:
		print(f"An error occurred while creating {send_data['data']['name']}: {e}")
		return None

def get_store_by_grocery_and_city(grocery, city):
	"""Retrieves stores by grocery name and city."""
	base_url = PRODUCT_RECEIVER_BASE_URL
	url = f'{base_url}/api/find'
	find_data = {
		"databaseName": "codex",
		"collectionName": "liiistStore",
		"filter": {
			"name": grocery,
			"city": city,
		}
	}
	
	try:
		response = requests.post(url, json=find_data)
		if response.status_code == 200:
			print("Stores found successfully.")
			return response.json()
		elif response.status_code == 400:
			print("Missing required fields.")
			return None
		elif response.status_code == 500:
			print("Server error.")
			return None
		else:
			print(f"Failed to find stores. Error: {response.status_code}")
			return None
	except requests.exceptions.RequestException as e:
		print(f"An error occurred while finding stores: {e}")
		return None
