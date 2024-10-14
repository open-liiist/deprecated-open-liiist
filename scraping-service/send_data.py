import requests

def send_data_to_receiver(product):

    url = 'http://product-receiver-service:3002/api/product'
    
    try:
        response = requests.post(url, json=product)
        if response.status_code == 201:
            print(f"Product sent successfully: {product['name']}")
        else:
            print(f"Failed to send {product['name']}. Error: {response.status_code}")

    except requests.exceptions.RequestException as e:
        print(f"An error occurred while sending {product['name']}: {e}")
