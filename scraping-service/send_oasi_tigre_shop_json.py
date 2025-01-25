#/scraping-service/send_oasi_tigre_shop_json.py
#Status: Working
import os
import time
import json
import logging
import requests
import ast
from typing import Any, Optional
from requests.exceptions import RequestException
from concurrent.futures import ThreadPoolExecutor, as_completed

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("send_oasi_tigre_shop_json.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

error_logger = logging.getLogger('error_logger')
error_handler = logging.FileHandler('send_oasi_tigre_shop_json_errors.log')
error_handler.setLevel(logging.ERROR)
formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s')
error_handler.setFormatter(formatter)
error_logger.addHandler(error_handler)

PRODUCT_RECEIVER_BASE_URL = os.getenv("PRODUCT_RECEIVER_BASE_URL", "http://localhost:3002/api")
STORE_ENDPOINT = "store"

MAX_RETRIES = int(os.getenv("MAX_RETRIES", 5))
BACKOFF_FACTOR = int(os.getenv("BACKOFF_FACTOR", 2))
MAX_THREADS = int(os.getenv("MAX_THREADS", 20))

def wait_for_service(endpoint: str, timeout: int = 60):
    """
    Aspetta che /health risponda con 200 OK.
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
        logger.debug("Servizio non pronto, riprovo in 5s...")
        time.sleep(5)
    err_msg = f"Servizio {url} non pronto entro {timeout}s."
    error_logger.error(err_msg)
    raise TimeoutError(err_msg)

def send_item_to_api(endpoint: str, item: dict, session: requests.Session):
    """
    Invia un negozio (store) a /store con retry su errori di rete o 5xx.
    """
    url = f"{PRODUCT_RECEIVER_BASE_URL}/{endpoint}"
    attempt = 0
    while attempt < MAX_RETRIES:
        try:
            logger.debug(f"Invio store a {url}: {json.dumps(item)}")
            response = session.post(url, json=item)
            response.raise_for_status()
            logger.info(f"Dato inviato con successo: {item.get('name')}")
            return True
        except RequestException as e:
            attempt += 1
            wait = BACKOFF_FACTOR ** attempt
            logger.warning(f"Errore invio store: {e}. Tentativo {attempt}/{MAX_RETRIES} tra {wait}s")
            try:
                err_data = response.json()
                logger.warning(f"Dettagli errore: {err_data}")
                error_logger.error(f"Errore store: {err_data}")
            except (json.JSONDecodeError, UnboundLocalError):
                logger.warning(f"Risposta non JSON: {getattr(response, 'text', 'No response')}")
            time.sleep(wait)
    error_logger.error(f"Fallito l'invio store dopo {MAX_RETRIES} tentativi: {item.get('name')}")
    return False

def rename_long_to_lng(store: dict) -> dict:
    """
    Se c'è 'long', lo rinomina in 'lng'.
    """
    if 'long' in store:
        store['lng'] = store.pop('long')
    return store

def parse_working_hours(wh_str: str) -> str:
    """
    Tenta di convertire la stringa in JSON. Se fallisce, la lascia com'è.
    """
    try:
        wh_dict = ast.literal_eval(wh_str)
        return json.dumps(wh_dict)
    except (ValueError, SyntaxError):
        logger.warning(f"Errore parsing working_hours: {wh_str}")
        return wh_str

def validate_store_data(store: dict) -> bool:
    """
    Verifica che name, lat, lng siano presenti e non vuoti.
    """
    required_fields = ['name', 'lat', 'lng']
    for r in required_fields:
        if r not in store or store[r] in [None, '']:
            logger.warning(f"Store mancante campo {r}: {store}")
            return False
    return True

def generate_entries(file_path: str):
    """
    Legge un file JSON con la lista di store.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for entry in data:
                yield entry
    except Exception as e:
        logger.error(f"Errore nel leggere il file {file_path}: {e}")
        error_logger.error(f"Errore nel leggere il file {file_path}: {e}")

def load_and_send(file_path: str):
    """
    Per ogni 'store' nel file JSON, manda i dati a /store.
    """
    logger.info(f"Inizio processare file: {file_path}")
    entries = generate_entries(file_path)
    count = 0
    skipped = 0

    with ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
        session = requests.Session()
        futures = []

        for entry in entries:
            store = rename_long_to_lng(entry)
            # Se working_hours è una stringa, la parse in JSON
            store['working_hours'] = parse_working_hours(store.get('working_hours', ""))

            # Se picks_up_in_shop è string, convertila in bool
            if 'picks_up_in_shop' in store and isinstance(store['picks_up_in_shop'], str):
                val = store['picks_up_in_shop'].strip().lower()
                store['picks_up_in_shop'] = val in ['true', '1', 'yes']

            # Se zip_code è None => ""
            if 'zip_code' in store and store['zip_code'] is None:
                store['zip_code'] = ""

            logger.debug(f"Store elaborato: {store}")

            if validate_store_data(store):
                payload = {
                    "name": store.get('name'),
                    "lat": store.get('lat'),
                    "lng": store.get('lng'),
                    "street": store.get('street', ""),
                    "city": store.get('city', ""),
                    "working_hours": store.get('working_hours', ""),
                    "picks_up_in_shop": store.get('picks_up_in_shop', False),
                    "zip_code": store.get('zip_code', "")
                }
                futures.append(executor.submit(send_item_to_api, STORE_ENDPOINT, payload, session))
                count += 1
            else:
                logger.info(f"Store non valido: {store.get('name')}")
                skipped += 1

        for future in as_completed(futures):
            future.result()  # Log eventuali eccezioni

    logger.info(f"Completato invio di {count} store dal file {file_path}. Skipped: {skipped}.")

def main():
    files_to_send = [
        {"file": "oasi_tigre_shop.json"}
    ]

    try:
        wait_for_service("health")
        logger.info("Servizio pronto, inizio invio store.")
    except TimeoutError as e:
        error_logger.error(e)
        logger.error(e)
        return

    for f in files_to_send:
        load_and_send(f["file"])

if __name__ == "__main__":
    main()


# ESEMPI DI STORE JSON:
# [
#   {
#     "name": "Supermercato Tigre",
#     "lat": 41.8015413,
#     "long": 12.5980664,
#     "street": "Piazza Trento e Trieste, 11",
#     "city": "Ciampino",
#     "zip_code": null,
#     "working_hours": "{'mon': {'morningOpen': '08:00'}, 'sun': {'morningOpen': '08:30'}}",
#     "picks_up_in_shop": "True"
#   },
#   {
#     "name": "",
#     "lat": 41.8,
#     "lng": 12.59
#   }
# ]
# Il secondo store manca 'name', e in parte è vuoto => non valido
