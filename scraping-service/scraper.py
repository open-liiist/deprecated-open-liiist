from send_data import send_data_to_receiver
from time import sleep

# Simulate product scraping with hardcoded data
def scrape_ecommerce():
    products = [
        {
            "full_name": "Laptop - X Pro",
            "name": "Laptop",
            "description": "A powerful laptop with great features",
            "price": 999.99,
            "discount": 10.0,
            "localization": {
                "grocery": "Tech Store",
                "lat": 40.7128,
                "long": -74.0060
            }
        },
        {
            "full_name": "Smartphone - Model Z",
            "name": "Smartphone",
            "description": "A smartphone with excellent camera",
            "price": 499.99,
            "discount": 15.0,
            "localization": {
                "grocery": "Mobile Shop",
                "lat": 34.0522,
                "long": -118.2437
            }
        }
    ]
    
    return products

if __name__ == "__main__":
    products = scrape_ecommerce()
    for product in products:
        sleep(5)
        # Send each product to the data-receiver service
        send_data_to_receiver(product)
