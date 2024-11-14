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
                "long": 30.0060
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
                "lat": 40.7127,
                "long": 30.0061
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
                "lat": 40.7108,
                "long": 30.0560
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
                "lat": 40.7129,
                "long": 30.0071
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
                "lat": 40.7126,
                "long": 30.0062
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
                "lat": 40.7125,
                "long": 30.0063
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
                "lat": 40.7124,
                "long": 30.0064
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
                "lat": 40.7123,
                "long": 30.0065
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
                "lat": 40.7122,
                "long": 30.0066
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
                "lat": 40.7121,
                "long": 30.0067
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
                "lat": 40.7120,
                "long": 30.0068
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
                "lat": 40.7119,
                "long": 30.0069
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
                "lat": 40.7118,
                "long": 30.0070
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
                "lat": 40.7117,
                "long": 30.0071
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
                "lat": 40.7116,
                "long": 30.0072
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
                "lat": 40.7115,
                "long": 30.0073
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
                "lat": 40.7114,
                "long": 30.0074
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
                "lat": 40.7113,
                "long": 30.0075
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
                "lat": 40.7112,
                "long": 30.0076
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
                "lat": 40.7111,
                "long": 30.0077
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
                "lat": 40.7110,
                "long": 30.0078
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
                "lat": 40.7109,
                "long": 30.0079
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
                "lat": 40.7108,
                "long": 30.0080
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
                "lat": 40.7107,
                "long": 30.0081
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
                "lat": 40.7106,
                "long": 30.0082
            }
        },
        {
            "full_name": "Laptop - Model A",
            "name": "Laptop",
            "description": "Basic laptop with essential features",
            "price": 899.99,
            "discount": 8.0,
            "localization": {
                "grocery": "Tech Outlet",
                "lat": 40.7127,
                "long": 30.0061  # Close to the "Tech Store" in Istanbul
            }
        },
        {
            "full_name": "Mouse - Ergonomic Design",
            "name": "Mouse",
            "description": "Ergonomic mouse for long hours of use",
            "price": 25.99,
            "discount": 12.0,
            "localization": {
                "grocery": "Tech Hub",
                "lat": 40.4168,
                "long": 30.7038
            }
        },
        {
            "full_name": "Laptop Stand - Deluxe Model",
            "name": "Laptop Stand",
            "description": "Adjustable laptop stand with additional storage",
            "price": 29.99,
            "discount": 15.0,
            "localization": {
                "grocery": "Office Supplies Hub",
                "lat": 40.7128,
                "long": 30.6185
            }
        },
        {
            "full_name": "Wireless Earbuds - Noise Cancelling",
            "name": "Wireless Earbuds",
            "description": "Advanced earbuds with superior noise cancelling",
            "price": 59.99,
            "discount": 10.0,
            "localization": {
                "grocery": "Audio Shop",
                "lat": 39.7392,
                "long": 30.2675
            }
        }
    ]
    
    return products

if __name__ == "__main__":
    products = scrape_ecommerce()
    sleep(15)
    for product in products:
        # Send each product to the data-receiver service
        send_data_to_receiver(product)
