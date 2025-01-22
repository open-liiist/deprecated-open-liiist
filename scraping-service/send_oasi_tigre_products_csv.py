#/scraping-service/send_oasi_tigre_products_csv.py
#Status: Improved

import os
import time
import json
import logging
import requests
import csv
from typing import Optional
from requests.exceptions import RequestException
from concurrent.futures import ThreadPoolExecutor, as_completed
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# ============================
# Logging Configuration
# ============================

# Main logger for general info and debug
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("send_oasi_tigre_products_csv.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Error logger for errors during sending
error_logger = logging.getLogger('error_logger')
error_handler = logging.FileHandler('send_oasi_tigre_products_csv_errors.log')
error_handler.setLevel(logging.ERROR)
formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s')
error_handler.setFormatter(formatter)
error_logger.addHandler(error_handler)

# Wrong products logger for problematic entries
wrong_products_logger = logging.getLogger('wrong_products_logger')
wrong_products_handler = logging.FileHandler('WrongProducts.log')
wrong_products_handler.setLevel(logging.WARNING)
wrong_products_formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s')
wrong_products_handler.setFormatter(wrong_products_formatter)
wrong_products_logger.addHandler(wrong_products_handler)

# ============================
# Configuration Variables
# ============================

PRODUCT_RECEIVER_BASE_URL = os.getenv("PRODUCT_RECEIVER_BASE_URL", "http://localhost:3002/api")
PRODUCT_ENDPOINT = "product"

MAX_RETRIES = int(os.getenv("MAX_RETRIES", 5))
BACKOFF_FACTOR = int(os.getenv("BACKOFF_FACTOR", 2))
MAX_THREADS = int(os.getenv("MAX_THREADS", 15))

# ============================
# Helper Functions
# ============================

def wait_for_service(endpoint: str, timeout: int = 60):
    """
    Waits for the specified service endpoint to be ready by polling the /health endpoint.
    """
    url = f"{PRODUCT_RECEIVER_BASE_URL}/{endpoint}"
    logger.info(f"Waiting for service {url} to be ready...")
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            resp = requests.get(url)
            if resp.status_code == 200:
                logger.info(f"Service {url} is ready.")
                return
        except RequestException:
            pass
        logger.debug("Service not ready. Retrying in 5 seconds...")
        time.sleep(5)
    raise TimeoutError(f"Service {url} not ready within {timeout} seconds.")

def generate_entries(file_path: str):
    """
    Reads a CSV file and yields each row as a dictionary.
    """
    try:
        with open(file_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                yield row
    except Exception as e:
        logger.error(f"Error reading {file_path}: {e}")
        error_logger.error(f"Error reading {file_path}: {e}")

def configure_session() -> requests.Session:
    """
    Configures a requests session with retry strategy and connection pool settings.
    """
    session = requests.Session()
    retries = Retry(
        total=MAX_RETRIES,
        backoff_factor=BACKOFF_FACTOR,
        status_forcelist=[500, 502, 503, 504],
        allowed_methods=["POST"]  # Updated from method_whitelist to allowed_methods
    )
    adapter = HTTPAdapter(
        max_retries=retries,
        pool_maxsize=MAX_THREADS,
        pool_block=True
    )
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session

def send_item_to_api(endpoint: str, item: dict, session: requests.Session) -> bool:
    """
    Sends a single product item to the API endpoint with retry logic.
    Logs any issues to wrong_products_logger.
    """
    url = f"{PRODUCT_RECEIVER_BASE_URL}/{endpoint}"
    attempt = 0
    while attempt < MAX_RETRIES:
        try:
            logger.debug(f"Sending data to {endpoint}: {json.dumps(item)}")
            response = session.post(url, json=item)
            logger.debug(f"Response status: {response.status_code}, Response body: {response.text}")

            if response.status_code == 201:
                # Optionally, verify if the product was actually saved
                response_data = response.json()
                if not response_data.get('id'):
                    # Assuming the API returns an 'id' for successfully created products
                    raise ValueError("API responded with 201 but no 'id' found in response.")
                logger.info(f"Successfully sent data to {endpoint}: {item.get('name') or item.get('full_name')}")
                return True
            else:
                response.raise_for_status()

        except RequestException as e:
            attempt += 1
            wait = BACKOFF_FACTOR ** attempt
            logger.warning(f"Send error: {e}. Attempt {attempt}/{MAX_RETRIES} after {wait}s")
            try:
                err_det = response.json()
                logger.warning(f"Error details: {err_det}")
                error_logger.error(f"Send error: {err_det}")
                wrong_products_logger.warning(f"Failed to send product: {item}. Error: {err_det}")
            except (json.JSONDecodeError, UnboundLocalError):
                logger.warning(f"Non-JSON response: {getattr(response, 'text', 'No response')}")
                wrong_products_logger.warning(f"Failed to send product: {item}. Non-JSON response: {getattr(response, 'text', 'No response')}")
            time.sleep(wait)
        except ValueError as ve:
            logger.error(f"Validation error: {ve}. Product: {item}")
            wrong_products_logger.warning(f"Validation error for product: {item}. Error: {ve}")
            return False
    # After retries, log the failed product
    error_logger.error(f"Failed to send after {MAX_RETRIES} attempts: {item.get('name') or item.get('full_name')}")
    wrong_products_logger.warning(f"Failed to send after {MAX_RETRIES} attempts: {item}")
    return False

def load_and_send(file_path: str):
    """
    Processes the CSV file and sends each product to the API concurrently.
    """
    logger.info(f"Starting to process file: {file_path}")
    entries = generate_entries(file_path)
    count = 0
    skipped = 0
    failed = 0

    with ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
        session = configure_session()
        futures = []

        for row in entries:
            # Extract and clean fields
            product = {
                "name": row.get('name', "").strip(),
                "full_name": row.get('full_name', "").strip(),
                "img_url": row.get('img_url', "").strip(),
                "description": row.get('description', ""),
                "price": row.get('price', 0.0),
                "discount": row.get('discount', 0.0),
                "price_for_kg": row.get('price_for_kg', 0.0),
                "localization": {
                    "grocery": row.get('localization.grocery', "").strip(),
                    "lat": row.get('localization.lat', 0.0),
                    "lng": row.get('localization.lng', 0.0)
                }
            }

            # Convert fields to appropriate types
            try:
                product["price"] = float(product["price"])
            except (ValueError, TypeError):
                product["price"] = 0.0

            try:
                product["discount"] = float(product["discount"])
            except (ValueError, TypeError):
                product["discount"] = 0.0

            try:
                product["price_for_kg"] = float(product["price_for_kg"])
            except (ValueError, TypeError):
                product["price_for_kg"] = 0.0

            try:
                product["localization"]["lat"] = float(product["localization"]["lat"])
                product["localization"]["lng"] = float(product["localization"]["lng"])
            except (ValueError, TypeError):
                product["localization"]["lat"] = 0.0
                product["localization"]["lng"] = 0.0

            # Skip entries without necessary fields
            if not product["full_name"] and not product["name"]:
                logger.warning(f"Missing full_name and name: {product}")
                skipped += 1
                wrong_products_logger.warning(f"Skipped product due to missing name fields: {product}")
                continue

            logger.debug(f"Processing product: {product}")
            futures.append(executor.submit(send_item_to_api, PRODUCT_ENDPOINT, product, session))
            count += 1

        # Monitor thread execution and handle exceptions
        for future in as_completed(futures):
            try:
                result = future.result()
                if not result:
                    failed += 1
            except Exception as e:
                logger.error(f"Unhandled exception during sending: {e}")
                error_logger.error(f"Unhandled exception during sending: {e}")
                failed += 1

    logger.info(f"Completed sending records from CSV file {file_path}. Total: {count}, Skipped: {skipped}, Failed: {failed}.")

# ============================
# Main Execution
# ============================

def main():
    # Example CSV file list
    files_to_send = [
        {"file": "oasi_tigre_products.csv"}
    ]

    try:
        wait_for_service("health")  # Wait for the API to be ready
        logger.info("Service is ready. Starting to send data.")
    except TimeoutError as e:
        error_logger.error(e)
        logger.error(e)
        return

    for item in files_to_send:
        load_and_send(item["file"])

if __name__ == "__main__":
    main()




# Esempi:
# # "Treccine patate e rosmarino 400 gr","Treccine patate e rosmarino 400 gr","https://...","",2.35,1.89,0.0,"Supermercato Tigre",41.959978,12.5351033
#
# RIGA NO (mancano full_name e name) => skip
# "","","","",2.99,0.5,0.0,"Supermercato Tigre",41.959978,12.5351033



# ESEMPI DI CSV:

# RIGA VALIDA:
# name,full_name,img_url,description,price,discount,price_for_kg,localization.grocery,localization.lat,localization.lng
# "Banane Del Monte vassoio 1kg","Banane Del Monte vassoio 1kg","https://www.example.com/banana.jpg","",2.49,0.0,0.0,"Supermercato Tigre",41.959978,12.5351033
#
# RIGA NON VALIDA (mancano full_name e name):
# "", "", "https://www.example.com/prodotto.jpg","",3.00,0.0,0.0,"Supermercato Tigre",41.959978,12.5351033
# ---

# Esempio di prodotto:
# name,full_name,img_url,description,price,discount,price_for_kg,localization.grocery,localization.lat,localization.lng
# Banane Del Monte vassoio 1kg circa,Banane Del Monte vassoio 1kg circa,https://www.oasitigre.it/content/dam/oasitigre/products/01/01/8/1/main/jcr:content/renditions/main-360x360.jpeg,,2.49,0.0,0.0,Supermercato Tigre,41.959978,12.5351033
