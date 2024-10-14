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
