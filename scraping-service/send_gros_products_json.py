#/scraping-service/send_gros_products_json.py
#Status: Working
import os
import time
import json
import logging
import requests
import ijson
from typing import Generator, Any
from requests.exceptions import RequestException
from decimal import Decimal
import ast
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("send_all_gros_products_json.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

error_logger = logging.getLogger('error_logger')
error_handler = logging.FileHandler('send_all_gros_products_json_ERRORS.log')
error_handler.setLevel(logging.ERROR)
formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s')
error_handler.setFormatter(formatter)
error_logger.addHandler(error_handler)

PRODUCT_RECEIVER_BASE_URL = os.getenv("PRODUCT_RECEIVER_BASE_URL", "http://localhost:3002/api")
MAX_RETRIES = int(os.getenv("MAX_RETRIES", 5))
BACKOFF_FACTOR = int(os.getenv("BACKOFF_FACTOR", 2))
MAX_THREADS = int(os.getenv("MAX_THREADS", 12))

thread_local = threading.local()

def get_session() -> requests.Session:
    if not hasattr(thread_local, "session"):
        thread_local.session = requests.Session()
    return thread_local.session

def wait_for_service(endpoint: str, timeout: int = 60):
    url = f"{PRODUCT_RECEIVER_BASE_URL}/{endpoint}"
    logger.info(f"Attesa che il servizio {url} sia pronto...")
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            response = requests.get(url)
            if response.status_code == 200:
                logger.info(f"Servizio {url} è pronto.")
                return
        except RequestException:
            pass
        logger.debug(f"Servizio {url} non pronto. Ritento tra 5 secondi...")
        time.sleep(5)
    error_logger.error(f"Servizio {url} non è pronto entro {timeout} secondi.")
    raise TimeoutError(f"Servizio {url} non pronto.")

def send_item_to_api(endpoint: str, item: dict) -> bool:
    url = f"{PRODUCT_RECEIVER_BASE_URL}/{endpoint}"
    session = get_session()
    attempt = 0
    while attempt < MAX_RETRIES:
        try:
            logger.debug(f"Invio dati a {endpoint}: {json.dumps(item)}")
            response = session.post(url, json=item)
            response.raise_for_status()
            logger.info(f"Dato inviato con successo a {endpoint}: {item.get('name') or item.get('full_name')}")
            return True
        except RequestException as e:
            attempt += 1
            wait = BACKOFF_FACTOR ** attempt
            logger.warning(f"Errore durante l'invio a {endpoint}: {e}. Tentativo {attempt}/{MAX_RETRIES} dopo {wait}s")
            try:
                error_details = response.json()
                logger.warning(f"Dettagli errore: {error_details}")
                error_logger.error(f"Errore durante l'invio a {endpoint}: {error_details}")
            except (json.JSONDecodeError, UnboundLocalError):
                logger.warning(f"Risposta non in formato JSON: {getattr(response, 'text', 'No response')}")
                error_logger.error(f"Errore durante l'invio: {e}. Risposta: {getattr(response, 'text', 'No response')}")
            time.sleep(wait)
    error_logger.error(f"Fallito l'invio a {endpoint} dopo {MAX_RETRIES} tentativi: {item.get('name') or item.get('full_name')}")
    return False

def convert_decimals(obj: Any) -> Any:
    """
    - Converte Decimal in float
    - Rinomina 'long' -> 'lng'
    - Converte working_hours se presente
    - Se picks_up_in_shop è string, la rende bool
    - Se manca discount in un product, lo setta a 0.0
    """
    if isinstance(obj, list):
        return [convert_decimals(i) for i in obj]
    elif isinstance(obj, dict):
        # 1) Rinomina 'long'->'lng'
        if 'long' in obj:
            obj['lng'] = obj.pop('long')

        # 2) Converte 'picks_up_in_shop' in bool se stringa
        if 'picks_up_in_shop' in obj and isinstance(obj['picks_up_in_shop'], str):
            val = obj['picks_up_in_shop'].strip().lower()
            obj['picks_up_in_shop'] = val in ['true', '1', 'yes']

        # 3) Gestisce 'working_hours'
        if 'working_hours' in obj and isinstance(obj['working_hours'], str):
            try:
                wh = obj['working_hours'].replace("'", '"')
                obj['working_hours'] = json.loads(wh)
            except (json.JSONDecodeError, TypeError):
                try:
                    obj['working_hours'] = ast.literal_eval(obj['working_hours'])
                except (ValueError, SyntaxError):
                    obj['working_hours'] = {}

        # 4) Se serve, serializziamo di nuovo working_hours
        if 'working_hours' in obj and isinstance(obj['working_hours'], (dict, list)):
            try:
                obj['working_hours'] = json.dumps(obj['working_hours'])
            except (TypeError, ValueError):
                obj['working_hours'] = ""

        # 5) Se è un product e manca discount => 0.0
        if 'discount' not in obj and ('name' in obj or 'full_name' in obj):
            obj['discount'] = 0.0

        # 6) Converte Decimal => float ricorsivamente
        for k, v in obj.items():
            if isinstance(v, Decimal):
                obj[k] = float(v)
            elif isinstance(v, (dict, list)):
                obj[k] = convert_decimals(v)

        return obj
    else:
        return obj

def validate_store_data(store: dict) -> bool:
    required_fields = ['name', 'lat', 'lng', 'picks_up_in_shop']
    for f in required_fields:
        if f not in store:
            logger.warning(f"Store mancante del campo {f}: {store}")
            return False
    return True

def validate_product_data(product: dict) -> bool:
    if 'price' not in product or 'localization' not in product:
        return False
    if 'full_name' not in product and 'name' not in product:
        return False
    return True

def generate_entries(file_path: str) -> Generator[dict, None, None]:
    """
    Usa ijson per leggere un grande file JSON (oggetto per oggetto).
    """
    try:
        with open(file_path, "rb") as f:
            first_char = f.read(1).decode('utf-8')
            f.seek(0)
            if first_char == '[':
                objects = ijson.items(f, 'item')
            else:
                # Se non è un array, comunque ijson: 'item'
                objects = ijson.items(f, 'item')
            for obj in objects:
                yield obj
    except Exception as e:
        logger.error(f"Errore nel leggere {file_path}: {e}")
        error_logger.error(f"Errore nel leggere {file_path}: {e}")

def load_and_send(file_path: str):
    """
    Distingue se l'entry è un product o uno store in base alla presenza di certi campi
    e invia al giusto endpoint.
    """
    logger.info(f"Inizio a processare il file: {file_path}")
    entries = generate_entries(file_path)
    count = 0
    skipped = 0

    with ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
        futures = []
        for entry in entries:
            entry = convert_decimals(entry)

            # Heuristica: se ha 'street' e 'picks_up_in_shop', lo consideriamo store
            is_store = all(key in entry for key in ['street', 'picks_up_in_shop'])
            # se ha 'price' e 'localization' => product
            is_product = ('price' in entry) and ('localization' in entry)

            if is_store:
                if validate_store_data(entry):
                    futures.append(executor.submit(send_item_to_api, 'store', entry))
                else:
                    logger.warning(f"Store non valido: {entry}")
                    skipped += 1
            elif is_product:
                if validate_product_data(entry):
                    futures.append(executor.submit(send_item_to_api, 'product', entry))
                else:
                    logger.warning(f"Product non valido: {entry}")
                    skipped += 1
            else:
                logger.warning(f"Oggetto sconosciuto (né store né product): {entry}")
                skipped += 1

            count += 1
            if count % 1000 == 0:
                logger.info(f"{count} record processati dal file {file_path}")

        for fut in as_completed(futures):
            try:
                fut.result()
            except Exception as e:
                logger.error(f"Errore nel task: {e}")
                skipped += 1

    logger.info(f"Completato invio di {count} record dal file {file_path}. {skipped} saltati.")

def main():
    files_to_send = [
        {"file": "gros_products.json"}
    ]

    try:
        wait_for_service("health")
        logger.info("Servizio pronto, inizio a inviare dati.")
    except TimeoutError as e:
        error_logger.error(e)
        logger.error(e)
        return

    for item in files_to_send:
        load_and_send(item["file"])

if __name__ == "__main__":
    main()


# ESEMPI DI DATO (product vs store) in all_gros_products.json:
# [
#   {
#     "name": "Pasta Barilla 500g",
#     "full_name": "Pasta Barilla 500g",
#     "price": 1.29,
#     "localization": {
#       "grocery": "All Gros Market",
#       "lat": 41.95555,
#       "long": 12.7748976
#     },
#     "discount": 0.0
#   },
#   {
#     "name": "Ipercarni xyz",
#     "lat": 41.8967068,
#     "long": 12.4822025,
#     "street": "Via di Casal Marmo, 329",
#     "city": "Roma",
#     "working_hours": "['Aperto la domenica8:30 - 13:00']",
#     "picks_up_in_shop": "True"
#   }
# ]
# - Il primo è un product (ha 'price' + 'localization')
# - Il secondo è uno store (ha 'street' + 'picks_up_in_shop')
# N.B.: localizzazione per store => lat, long, + name => /store
