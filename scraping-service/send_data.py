import os
import requests
from dotenv import load_dotenv

load_dotenv()

def send_data_to_receiver(product):

    base_url = os.getenv('PRODUCT_RECEIVER_BASE_URL', 'http://product-receiver-service:3002')
    url = f'{base_url}/api/product'
    
    try:
        response = requests.post(url, json=product)
        if response.status_code == 201:
            print(f"Product sent successfully: {product['name']}")
        else:
            print(f"Failed to send {product['name']}. Error: {response.status_code}")

    except requests.exceptions.RequestException as e:
        print(f"An error occurred while sending {product['name']}: {e}")

def send_shop_info_to_receiver(shop_data):

    base_url = os.getenv('SHOP_RECEIVER_BASE_URL', 'http://shop-receiver-service:3001')
    url = f'{base_url}/api/shop'

    try:
        response = requests.post(url, json=shop_data)
        if response.status_code == 201:
            print(f"Shop information sent successfully: {shop_data['name']}")
        else:
            print(f"Failed to send {shop_data['name']}. Error: {response.status_code}")

    except requests.exceptions.RequestException as e:
        print(f"An error occurred while sending {shop_data['name']}: {e}")

