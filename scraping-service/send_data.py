import os
import requests
from dotenv import load_dotenv

load_dotenv()

PRODUCT_RECEIVER_BASE_URL = os.getenv('PRODUCT_RECEIVER_BASE_URL', 'http://product-receiver-service:3002')

def send_data_to_receiver(product):

    base_url = PRODUCT_RECEIVER_BASE_URL
    url = f'{base_url}/api/product'
    
    try:
        response = requests.post(url, json=product)
        if response.status_code == 201:
            print(f"Product sent successfully: {product['name']}")
        else:
            print(f"Failed to send {product['name']}. Error: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"An error occurred while sending {product['name']}: {e}")

def create_store(store):
    """Creates a new store with provided data."""
    base_url = PRODUCT_RECEIVER_BASE_URL
    url = f'{base_url}/api/store'
    
    try:
        response = requests.post(url, json=store)
        if response.status_code == 201:
            print(f"Store created successfully: {store['name']}")
            return response.json()
        else:
            print(f"Failed to create {store['name']}. Error: {response.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"An error occurred while creating {store['name']}: {e}")
        return None

def get_all_stores():
    """Retrieves all stores."""
    base_url = PRODUCT_RECEIVER_BASE_URL
    url = f'{base_url}/api/store'
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            print("Retrieved stores successfully.")
            return response.json()
        else:
            print(f"Failed to retrieve stores. Error: {response.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"An error occurred while retrieving stores: {e}")
        return None

def get_store_by_grocery_and_city(grocery, city):
    """Retrieves stores by grocery name and city."""
    base_url = PRODUCT_RECEIVER_BASE_URL
    url = f'{base_url}/api/store/{grocery}/{city}'
    
    try:
        response = requests.get(url)
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

def test_create_store(data):
    """Tests creating a new store with provided data."""
    base_url = PRODUCT_RECEIVER_BASE_URL
    url = f'{base_url}/api/store'
    response = requests.post(url, json=data)
    
    try:
        if response.status_code == 201:
            print("Store created successfully:", response.json())
        elif response.status_code == 400:
            print("Validation error:", response.json())
        else:
            print("Unexpected status code:", response.status_code, response.text)
    except Exception as e:
        print("test_create_store - An error occurred:", e)

def test_get_all_stores():
    """Tests retrieving all stores."""
    base_url = PRODUCT_RECEIVER_BASE_URL
    url = f'{base_url}/api/store'
    response = requests.get(url)
    
    try:
        if response.status_code == 200:
            print("Retrieved stores:", response.json())
        else:
            print("Unexpected status code:", response.status_code, response.text)
    except Exception as e:
        print("test_get_all_stores - An error occurred:", e)

def test_get_store_by_grocery_and_city(grocery, city):
    """Tests retrieving stores by grocery name and city."""
    base_url = PRODUCT_RECEIVER_BASE_URL
    url = f'{base_url}/api/store/{grocery}/{city}'
    response = requests.get(url)
    
    try:
        if response.status_code == 200:
            print("Stores found:", response.json())
        elif response.status_code == 400:
            print("Missing required fields:", response.json())
        elif response.status_code == 500:
            print("Server error:", response.json())
        else:
            print("Unexpected status code:", response.status_code, response.text)
    except Exception as e:
        print("test_get_store_by_grocery_and_city - An error occurred:", e)
