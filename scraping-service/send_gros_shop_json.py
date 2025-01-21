#/scraping-service/send_gros_shop_json.py
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
        logging.FileHandler("all_shop_gros_send.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Logger separato per gli errori
error_logger = logging.getLogger('error_logger')
error_handler = logging.FileHandler('all_shop_gros_errors.log')
error_handler.setLevel(logging.ERROR)
formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s')
error_handler.setFormatter(formatter)
error_logger.addHandler(error_handler)

# Base URL del servizio
PRODUCT_RECEIVER_BASE_URL = os.getenv("PRODUCT_RECEIVER_BASE_URL", "http://localhost:3002/api")

# Endpoint aggiornato per i negozi
STORE_ENDPOINT = "store"  # Assicurati che sia "store"

# Configurazione dei retry
MAX_RETRIES = int(os.getenv("MAX_RETRIES", 5))
BACKOFF_FACTOR = int(os.getenv("BACKOFF_FACTOR", 2))  # Secondi di attesa aumentano esponenzialmente

# Numero massimo di thread
MAX_THREADS = int(os.getenv("MAX_THREADS", 10))  # Puoi aumentare questo numero per più velocità


def wait_for_service(endpoint: str, timeout: int = 60):
    """
    Attende che un servizio sia pronto controllando l'endpoint.
    Solleva un TimeoutError se il servizio non è pronto entro il timeout.
    """
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


def send_item_to_api(endpoint: str, item: dict, session: requests.Session):
    """
    Invia un singolo dato a un endpoint specifico con meccanismo di retry.
    """
    url = f"{PRODUCT_RECEIVER_BASE_URL}/{endpoint}"
    attempt = 0
    while attempt < MAX_RETRIES:
        try:
            logger.debug(f"Invio dati a {endpoint}: {json.dumps(item)}")
            response = session.post(url, json=item)
            response.raise_for_status()
            logger.info(f"Dato inviato con successo a {endpoint}: {item.get('name')}")
            return True
        except RequestException as e:
            attempt += 1
            wait = BACKOFF_FACTOR ** attempt
            logger.warning(f"Errore durante l'invio a {endpoint}: {e}. Tentativo {attempt}/{MAX_RETRIES} dopo {wait}s")
            # Log aggiuntivo per dettagli dell'errore
            try:
                error_details = response.json()
                logger.warning(f"Dettagli errore: {error_details}")
                error_logger.error(f"Errore durante l'invio a {endpoint}: {error_details}")
            except (json.JSONDecodeError, UnboundLocalError):
                # UnboundLocalError può verificarsi se 'response' non è definito
                logger.warning(f"Risposta dell'errore non in formato JSON: {getattr(response, 'text', 'No response')}")
                error_logger.error(f"Errore durante l'invio a {endpoint}: {e}. Risposta: {getattr(response, 'text', 'No response')}")
            time.sleep(wait)
    error_logger.error(f"Fallito l'invio a {endpoint} dopo {MAX_RETRIES} tentativi: {item.get('name')}")
    logger.error(f"Fallito l'invio a {endpoint} dopo {MAX_RETRIES} tentativi: {item.get('name')}")
    return False


def validate_store_data(store: dict) -> bool:
    """
    Valida i dati di un negozio prima dell'invio.
    """
    # Controllo dei campi di primo livello
    required_fields = ['name', 'lat', 'lng']
    for field in required_fields:
        if field not in store or store[field] in [None, '']:
            logger.warning(f"Campo mancante o vuoto: {field} in {store}")
            return False

    # Conversione dei campi numerici
    try:
        store['lat'] = float(store['lat'])
        store['lng'] = float(store['lng'])
    except (ValueError, TypeError):
        logger.warning(f"Errore nella conversione dei campi numerici in {store}")
        return False

    return True


def rename_long_to_lng(store: dict) -> dict:
    """
    Rinomina 'long' a 'lng' nei dati del negozio (se presente).
    """
    if 'long' in store:
        store['lng'] = store.pop('long')
    return store


def parse_working_hours(working_hours_str: str) -> str:
    """
    Converte la stringa di working_hours da formato Python list/dict a JSON.
    """
    try:
        wh_data = ast.literal_eval(working_hours_str)
        return json.dumps(wh_data)
    except (ValueError, SyntaxError):
        logger.warning(f"Errore nel parsing di working_hours: {working_hours_str}")
        return working_hours_str  # Ritorna la stringa originale se il parsing fallisce


def generate_entries(file_path: str):
    """
    Genera gli entry da un file JSON usando un generatore
    per evitare di caricare tutto in memoria.
    """
    try:
        with open(file_path, mode='r', encoding='utf-8') as file:
            data = json.load(file)
            for entry in data:
                yield entry
    except Exception as e:
        logger.error(f"Errore nel leggere il file {file_path}: {e}")
        error_logger.error(f"Errore nel leggere il file {file_path}: {e}")


def load_and_send(file_path: str):
    """
    Legge un file JSON e invia i dati dei negozi all'endpoint /store.
    """
    logger.info(f"Inizio a processare il file: {file_path}")
    entries = generate_entries(file_path)
    count = 0
    skipped = 0

    with ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
        session = requests.Session()  # Usa una sessione per riutilizzare le connessioni
        futures = []

        for entry in entries:
            # 1) Rinominare 'long' -> 'lng'
            store = rename_long_to_lng(entry)

            # 2) Parse working_hours
            store['working_hours'] = parse_working_hours(store.get('working_hours', "[]"))

            # 3) Convert picks_up_in_shop da stringa a boolean
            if 'picks_up_in_shop' in store and isinstance(store['picks_up_in_shop'], str):
                val = store['picks_up_in_shop'].strip().lower()
                store['picks_up_in_shop'] = val in ['true', '1', 'yes']

            logger.debug(f"Processed store after picks_up_in_shop fix: {store}")

            # 4) Valida i dati
            if validate_store_data(store):
                # Prepara il payload secondo lo schema Prisma
                payload = {
                    "name": store.get('name'),
                    "lat": store.get('lat'),
                    "lng": store.get('lng'),
                    "street": store.get('street', ""),
                    "city": store.get('city', ""),
                    "working_hours": store.get('working_hours', ""),
                    "picks_up_in_shop": store.get('picks_up_in_shop', False),
                    "zip_code": store.get('zip_code') if store.get('zip_code') else ""
                }
                futures.append(executor.submit(send_item_to_api, STORE_ENDPOINT, payload, session))
                count += 1
            else:
                logger.info(f"Salto del negozio a causa di dati mancanti o non validi: {store.get('name')}")
                skipped += 1

        for future in as_completed(futures):
            result = future.result()
            if not result:
                # Se c'è un errore di rete o HTTP 4xx dopo i retry, non incrementiamo 'count'.
                pass

    logger.info(f"Completato l'invio di {count} record dal file {file_path}. {skipped} record saltati.")


def main():
    # Percorsi ai file JSON da inviare - Aggiorna i percorsi se necessario
    files_to_send = [
        {"file": "gros_shop.json"}
    ]

    # Attesa della prontezza dei servizi
    try:
        # Verifica che l'endpoint di health check sia pronto - Assicurati che l'endpoint sia /health
        wait_for_service("health")
        logger.info("Servizio è pronto. Inizio a inviare dati.")
    except TimeoutError as e:
        error_logger.error(e)
        logger.error(e)
        return

    # Inizio dell'invio dei dati
    for item in files_to_send:
        load_and_send(item["file"])


if __name__ == "__main__":
    main()

    # Esempio VALIDO di store:
    # {
    #     "name": "pim",
    #     "street": "Via Sant'Elia, 13",
    #     "lat": 41.8967068,
    #     "long": 12.4822025,
    #     "city": "Roma",
    #     "working_hours": "['7:00 - 22:00 (continuato)', 'Aperto la domenica7:00 - 22:00']",
    #     "picks_up_in_shop": "True",
    #     "zip_code": null
    # },