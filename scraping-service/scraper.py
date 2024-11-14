from send_data import send_data_to_receiver, test_create_store, test_get_all_stores, test_get_store_by_grocery_and_city
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
        },
        {
            "full_name": "Headphones - Model Y",
            "name": "Headphones",
            "description": "Wireless headphones with noise cancellation",
            "price": 199.99,
            "discount": 5.0,
            "localization": {
                "grocery": "Electronics Store",
                "lat": 37.7749,
                "long": -122.4194
            }
        },
        {
            "full_name": "Smartwatch - Model X",
            "name": "Smartwatch",
            "description": "A smartwatch with fitness tracking",
            "price": 299.99,
            "discount": 20.0,
            "localization": {
                "grocery": "Wearables Store",
                "lat": 51.5074,
                "long": -0.1278
            }
        },
        {
            "full_name": "Tablet - Model Z",
            "name": "Tablet",
            "description": "A tablet with a large screen",
            "price": 399.99,
            "discount": 25.0,
            "localization": {
                "grocery": "Tech Store",
                "lat": 48.8566,
                "long": 2.3522
            }
        },
        {
            "full_name": "Camera - Model Y",
            "name": "Camera",
            "description": "A camera with high resolution",
            "price": 599.99,
            "discount": 30.0,
            "localization": {
                "grocery": "Camera Store",
                "lat": 35.6895,
                "long": 139.6917
            }
        },
        {
            "full_name": "Printer - Model X",
            "name": "Printer",
            "description": "A printer with wireless connectivity",
            "price": 199.99,
            "discount": 10.0,
            "localization": {
                "grocery": "Office Supplies Store",
                "lat": 55.7558,
                "long": 37.6176
            }
        },
        {
            "full_name": "Gaming Console - Model Z",
            "name": "Gaming Console",
            "description": "A gaming console with 4K support",
            "price": 499.99,
            "discount": 15.0,
            "localization": {
                "grocery": "Gaming Store",
                "lat": 52.5200,
                "long": 13.4050
            }
        },
        {
            "full_name": "Smart Speaker - Model Y",
            "name": "Smart Speaker",
            "description": "A smart speaker with voice assistant",
            "price": 99.99,
            "discount": 5.0,
            "localization": {
                "grocery": "Electronics Store",
                "lat": 40.4168,
                "long": -3.7038
            }
        },
        {
            "full_name": "External Hard Drive - Model X",
            "name": "External Hard Drive",
            "description": "An external hard drive with large capacity",
            "price": 79.99,
            "discount": 10.0,
            "localization": {
                "grocery": "Tech Store",
                "lat": 52.3667,
                "long": 4.8945
            }
        },
        {
            "full_name": "Wireless Router - Model Z",
            "name": "Wireless Router",
            "description": "A wireless router with fast speed",
            "price": 59.99,
            "discount": 5.0,
            "localization": {
                "grocery": "Electronics Store",
                "lat": 48.8566,
                "long": 2.3522
            }
        },
        {
            "full_name": "Monitor - Model Y",
            "name": "Monitor",
            "description": "A monitor with high resolution",
            "price": 199.99,
            "discount": 15.0,
            "localization": {
                "grocery": "Tech Store",
                "lat": 51.5074,
                "long": -0.1278
            }
        },
        {
            "full_name": "Keyboard - Model X",
            "name": "Keyboard",
            "description": "A keyboard with RGB lighting",
            "price": 49.99,
            "discount": 5.0,
            "localization": {
                "grocery": "Electronics Store",
                "lat": 37.7749,
                "long": -122.4194
            }
        },
        {
            "full_name": "Mouse - Model Z",
            "name": "Mouse",
            "description": "A mouse with ergonomic design",
            "price": 19.99,
            "discount": 10.0,
            "localization": {
                "grocery": "Tech Store",
                "lat": 34.0522,
                "long": -118.2437
            }
        },
        {
            "full_name": "Webcam - Model Y",
            "name": "Webcam",
            "description": "A webcam with HD resolution",
            "price": 29.99,
            "discount": 5.0,
            "localization": {
                "grocery": "Electronics Store",
                "lat": 40.7128,
                "long": -74.0060
            }
        },
        {
            "full_name": "USB Flash Drive - Model X",
            "name": "USB Flash Drive",
            "description": "A USB flash drive with compact size",
            "price": 9.99,
            "discount": 10.0,
            "localization": {
                "grocery": "Tech Store",
                "lat": 35.6895,
                "long": 139.6917
            }
        },
        {
            "full_name": "Power Bank - Model Z",
            "name": "Power Bank",
            "description": "A power bank with fast charging",
            "price": 19.99,
            "discount": 5.0,
            "localization": {
                "grocery": "Electronics Store",
                "lat": 55.7558,
                "long": 37.6176
            }
        },
        {
            "full_name": "Smart Plug - Model Y",
            "name": "Smart Plug",
            "description": "A smart plug with remote control",
            "price": 14.99,
            "discount": 15.0,
            "localization": {
                "grocery": "Tech Store",
                "lat": 52.5200,
                "long": 13.4050
            }
        },
        {
            "full_name": "HDMI Cable - Model X",
            "name": "HDMI Cable",
            "description": "An HDMI cable with gold-plated connectors",
            "price": 9.99,
            "discount": 10.0,
            "localization": {
                "grocery": "Electronics Store",
                "lat": 48.8566,
                "long": 2.3522
            }
        },
        {
            "full_name": "Ethernet Cable - Model Z",
            "name": "Ethernet Cable",
            "description": "An Ethernet cable with high speed",
            "price": 4.99,
            "discount": 5.0,
            "localization": {
                "grocery": "Tech Store",
                "lat": 51.5074,
                "long": -0.1278
            }
        },
        {
            "full_name": "MicroSD Card - Model Y",
            "name": "MicroSD Card",
            "description": "A MicroSD card with large capacity",
            "price": 14.99,
            "discount": 10.0,
            "localization": {
                "grocery": "Electronics Store",
                "lat": 37.7749,
                "long": -122.4194
            }
        },
        {
            "full_name": "Bluetooth Speaker - Model X",
            "name": "Bluetooth Speaker",
            "description": "A Bluetooth speaker with stereo sound",
            "price": 29.99,
            "discount": 5.0,
            "localization": {
                "grocery": "Tech Store",
                "lat": 34.0522,
                "long": -118.2437
            }
        },
        {
            "full_name": "Wireless Earbuds - Model Z",
            "name": "Wireless Earbuds",
            "description": "Wireless earbuds with noise isolation",
            "price": 39.99,
            "discount": 15.0,
            "localization": {
                "grocery": "Electronics Store",
                "lat": 40.7128,
                "long": -74.0060
            }
        },
        {
            "full_name": "Car Charger - Model Y",
            "name": "Car Charger",
            "description": "A car charger with multiple ports",
            "price": 9.99,
            "discount": 5.0,
            "localization": {
                "grocery": "Tech Store",
                "lat": 35.6895,
                "long": 139.6917
            }
        },
        {
            "full_name": "Laptop Stand - Model X",
            "name": "Laptop Stand",
            "description": "A laptop stand with adjustable height",
            "price": 19.99,
            "discount": 10.0,
            "localization": {
                "grocery": "Electronics Store",
                "lat": 55.7558,
                "long": 37.6176
            }
        },
    ]
    
    return products

def test_stores_endpoints():
    new_store_data = {
        "name": "SuperMart",
        "lat": 41.9028,
        "long": 12.4964,
        "street": "Via Example, 1",
        "city": "Rome",
        "working_hours": "8:00 AM - 10:00 PM",
        "picks_up_in_shop": True,
        "zip_code": "00184"
    }
    test_create_store(new_store_data)
    test_get_all_stores()
    test_get_store_by_grocery_and_city("SuperMart", "Rome")

if __name__ == "__main__":
    test_stores_endpoints()
    products = scrape_ecommerce()
    sleep(15)
    for product in products:
        # Send each product to the data-receiver service
        send_data_to_receiver(product)
