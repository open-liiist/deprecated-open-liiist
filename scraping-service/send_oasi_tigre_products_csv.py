#/scraping-service/send_oasi_tigre_products_csv.py
#Status: Working
import os
import time
import json
import logging
import requests
import csv
from typing import Optional
from requests.exceptions import RequestException
from concurrent.futures import ThreadPoolExecutor, as_completed

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("send_oasi_tigre_products_csv.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

error_logger = logging.getLogger('error_logger')
error_handler = logging.FileHandler('send_oasi_tigre_products_csv_errors.log')
error_handler.setLevel(logging.ERROR)
formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s')
error_handler.setFormatter(formatter)
error_logger.addHandler(error_handler)

PRODUCT_RECEIVER_BASE_URL = os.getenv("PRODUCT_RECEIVER_BASE_URL", "http://localhost:3002/api")
PRODUCT_ENDPOINT = "product"

MAX_RETRIES = int(os.getenv("MAX_RETRIES", 5))
BACKOFF_FACTOR = int(os.getenv("BACKOFF_FACTOR", 2))
MAX_THREADS = int(os.getenv("MAX_THREADS", 15))

def wait_for_service(endpoint: str, timeout: int = 60):
    """
    Controlla se /health risponde con 200 OK entro 'timeout' secondi.
    """
    url = f"{PRODUCT_RECEIVER_BASE_URL}/{endpoint}"
    logger.info(f"Attesa che il servizio {url} sia pronto...")
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            resp = requests.get(url)
            if resp.status_code == 200:
                logger.info(f"Servizio {url} è pronto.")
                return
        except RequestException:
            pass
        logger.debug("Servizio non pronto. Ritento in 5s...")
        time.sleep(5)
    raise TimeoutError(f"Servizio {url} non pronto entro {timeout}s.")

def send_item_to_api(endpoint: str, item: dict, session: requests.Session) -> bool:
    """
    Invia i dati a /product con meccanismo di retry.
    """
    url = f"{PRODUCT_RECEIVER_BASE_URL}/{endpoint}"
    attempt = 0
    while attempt < MAX_RETRIES:
        try:
            logger.debug(f"Invio dati a {endpoint}: {json.dumps(item)}")
            response = session.post(url, json=item)
            response.raise_for_status()  # se >= 400 alza eccezione
            logger.info(f"Dato inviato con successo a {endpoint}: {item.get('name') or item.get('full_name')}")
            return True
        except RequestException as e:
            attempt += 1
            wait = BACKOFF_FACTOR ** attempt
            logger.warning(f"Errore invio: {e}. Tentativo {attempt}/{MAX_RETRIES} dopo {wait}s")
            try:
                err_det = response.json()
                logger.warning(f"Dettagli errore: {err_det}")
                error_logger.error(f"Errore invio: {err_det}")
            except (json.JSONDecodeError, UnboundLocalError):
                logger.warning(f"Risposta non JSON: {getattr(response, 'text', 'No response')}")
            time.sleep(wait)
    error_logger.error(f"Fallito l'invio dopo {MAX_RETRIES} tentativi: {item.get('name') or item.get('full_name')}")
    return False

def generate_entries(file_path: str):
    """
    Legge un file CSV riga per riga e produce i dizionari con DictReader.
    """
    try:
        with open(file_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                yield row
    except Exception as e:
        logger.error(f"Errore nel leggere {file_path}: {e}")
        error_logger.error(f"Errore nel leggere {file_path}: {e}")

def load_and_send(file_path: str):
    """
    Legge i dati da CSV e invia i prodotti a /product.
    """
    logger.info(f"Inizio a processare il file: {file_path}")
    entries = generate_entries(file_path)
    count = 0
    skipped = 0

    with ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
        session = requests.Session()
        futures = []

        for row in entries:
            # Esempio di header CSV:
            # name,full_name,img_url,description,price,discount,price_for_kg,localization.grocery,localization.lat,localization.lng

            # estraiamo i campi
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

            # conversioni float
            try:
                product["price"] = float(product["price"])
            except (ValueError, TypeError):
                product["price"] = 0.0

            try:
                product["discount"] = float(product["discount"])
            except (ValueError, TypeError):
                product["discount"] = 0.0
            # CLAMP discount <= 1.0
            if product["discount"] > 1.0:
                product["discount"] = 1.0

            try:
                product["price_for_kg"] = float(product["price_for_kg"])
            except (ValueError, TypeError):
                product["price_for_kg"] = 0.0

            # fix lat/lng
            try:
                product["localization"]["lat"] = float(product["localization"]["lat"])
                product["localization"]["lng"] = float(product["localization"]["lng"])
            except (ValueError, TypeError):
                product["localization"]["lat"] = 0.0
                product["localization"]["lng"] = 0.0

            # Se mancano full_name e name => skip
            if not product["full_name"] and not product["name"]:
                logger.warning(f"Mancano full_name e name: {product}")
                skipped += 1
                continue

            logger.debug(f"Elaboro product: {product}")
            futures.append(executor.submit(send_item_to_api, PRODUCT_ENDPOINT, product, session))
            count += 1

        # Aspettiamo la fine di tutti i thread
        for future in as_completed(futures):
            future.result()  # se eccezione, log

    logger.info(f"Completato l'invio di {count} record dal file CSV {file_path}. Skipped {skipped}.")

def main():
    # Esempio di CSV:
    # name,full_name,img_url,description,price,discount,price_for_kg,localization.grocery,localization.lat,localization.lng
    # "Treccine patate e rosmarino 400 gr","Treccine patate e rosmarino 400 gr","https://....jpg","",2.35,1.89,0.0,"Supermercato Tigre",41.959978,12.5351033
    # => discount = 1.89 --> lo clampo a 1.0
    files_to_send = [
        {"file": "oasi_tigre_products.csv"}
    ]

    try:
        wait_for_service("health")  # aspettiamo che /health risponda
        logger.info("Servizio pronto. Inizio l'invio.")
    except TimeoutError as e:
        error_logger.error(e)
        logger.error(e)
        return

    for item in files_to_send:
        load_and_send(item["file"])

if __name__ == "__main__":
    main()


# Esempi:
# RIGA con discount 1.89 => clamp a 1.0
# "Treccine patate e rosmarino 400 gr","Treccine patate e rosmarino 400 gr","https://...","",2.35,1.89,0.0,"Supermercato Tigre",41.959978,12.5351033
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
