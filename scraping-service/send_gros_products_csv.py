# # send_gros_products_csv.py -> updated version 02 10 2025
#!/usr/bin/env python3
from dotenv import load_dotenv
load_dotenv()  # Carica le variabili d'ambiente dal file .env

import os
import csv
import asyncio
import aiohttp
import logging
from aiohttp import ClientSession, ClientConnectorError, ClientResponseError
from asyncio import Semaphore
from typing import Dict, Any, Generator
from tqdm.asyncio import tqdm_asyncio

# Configurazione delle variabili d'ambiente
PRODUCT_RECEIVER_BASE_URL = os.getenv("PRODUCT_RECEIVER_BASE_URL", "http://localhost:3002/api")
# Se il valore non termina con '/api', aggiungilo
if not PRODUCT_RECEIVER_BASE_URL.endswith("/api"):
    PRODUCT_RECEIVER_BASE_URL = PRODUCT_RECEIVER_BASE_URL.rstrip("/") + "/api"

MAX_RETRIES = int(os.getenv("MAX_RETRIES", 5))
BACKOFF_FACTOR = float(os.getenv("BACKOFF_FACTOR", 1.5))
MAX_CONCURRENT_REQUESTS = int(os.getenv("MAX_CONCURRENT_REQUESTS", 100))
CSV_FILE_PATH = os.getenv("CSV_FILE_PATH", "gros_products.csv")
LOG_FILE = os.getenv("LOG_FILE", "send_gros_products_csv.log")
ERROR_LOG_FILE = os.getenv("ERROR_LOG_FILE", "send_gros_products_csv_ERRORS.log")

# Configurazione del logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        # logging.StreamHandler()  # Decommenta se vuoi anche l'output su console
    ]
)
logger = logging.getLogger(__name__)

error_logger = logging.getLogger('error_logger')
error_handler = logging.FileHandler(ERROR_LOG_FILE)
error_handler.setLevel(logging.ERROR)
formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s')
error_handler.setFormatter(formatter)
error_logger.addHandler(error_handler)

async def send_product(session: ClientSession, semaphore: Semaphore, product: Dict[str, Any], retries: int = MAX_RETRIES) -> bool:
    """
    Invia un prodotto al endpoint /product con retry e backoff esponenziale.
    """
    url = f"{PRODUCT_RECEIVER_BASE_URL}/product"
    attempt = 0
    print("PRODUCT_RECEIVER_BASE_URL:", PRODUCT_RECEIVER_BASE_URL)
    while attempt < retries:
        try:
            async with semaphore:
                async with session.post(url, json=product) as response:
                    response.raise_for_status()
                    resp_json = await response.json()
                    logger.info(f"Prodotto inviato con successo: {product.get('name') or product.get('full_name')}")
                    return True
        except (ClientConnectorError, ClientResponseError, asyncio.TimeoutError) as e:
            attempt += 1
            wait_time = BACKOFF_FACTOR ** attempt
            logger.warning(f"Errore durante l'invio del prodotto '{product.get('name') or product.get('full_name')}'. "
                           f"Tentativo {attempt}/{retries}. Ritento tra {wait_time} secondi. Errore: {e}")
            await asyncio.sleep(wait_time)
        except Exception as e:
            error_logger.error(f"Errore inatteso durante l'invio del prodotto '{product.get('name') or product.get('full_name')}': {e}")
            return False
    error_logger.error(f"Fallito l'invio del prodotto dopo {retries} tentativi: {product.get('name') or product.get('full_name')}")
    return False

def process_row(row: Dict[str, str]) -> Dict[str, Any]:
    """
    Processa una riga del CSV e la trasforma nel formato richiesto dall'API.
    Se la colonna 'localization.street' non è presente, usa "unknown" come default.
    """
    try:
        product = {
            "full_name": row.get("full_name", "").strip(),
            "name": row.get("name", "").strip(),
            "description": row.get("description", "").strip() or None,
            "price": float(row.get("price", 0)),
            "discount": float(row.get("discount", 0)) if row.get("discount") else 0.0,
            "price_for_kg": float(row.get("price_for_kg", 0)) if row.get("price_for_kg") else 0.0,
            "localization": {
                "grocery": row.get("localization.grocery", "").strip(),
                "lat": float(row.get("localization.lat", 0)),
                "lng": float(row.get("localization.lng", 0)),
                "street": row.get("localization.street", "unknown").strip() or "unknown"
            },
            "img_url": row.get("img_url", "").strip() or None
        }
        return product
    except Exception as e:
        error_logger.error(f"Errore nel processare la riga {row}: {e}")
        return None

async def async_csv_reader(reader: csv.DictReader) -> Generator[Dict[str, str], None, None]:
    """
    Lettore CSV asincrono che permette ad altre coroutine di eseguire.
    """
    for row in reader:
        yield row
        await asyncio.sleep(0)  # Permette ad altre coroutine di eseguire

async def main():
    """
    Funzione principale che gestisce la lettura del CSV e l'invio dei prodotti.
    """
    if not os.path.exists(CSV_FILE_PATH):
        logger.error(f"File CSV non trovato: {CSV_FILE_PATH}")
        return

    with open(CSV_FILE_PATH, 'r', encoding='utf-8') as f:
        total_lines = sum(1 for _ in f) - 1  # Sottrai l'header

    semaphore = Semaphore(MAX_CONCURRENT_REQUESTS)
    connector = aiohttp.TCPConnector(limit=MAX_CONCURRENT_REQUESTS)
    timeout = aiohttp.ClientTimeout(total=60)

    async with ClientSession(connector=connector, timeout=timeout) as session:
        tasks = []
        successes = 0
        failures = 0

        with open(CSV_FILE_PATH, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            pbar = tqdm_asyncio(total=total_lines, desc="Invio Prodotti", unit="prodotti")
            async for row in async_csv_reader(reader):
                product = process_row(row)
                if product:
                    task = asyncio.create_task(send_product(session, semaphore, product))
                    tasks.append(task)
                else:
                    failures += 1
                    pbar.update(1)
            pbar.close()

        for future in asyncio.as_completed(tasks):
            result = await future
            if result:
                successes += 1
            else:
                failures += 1

        logger.info(f"Invio completato. Successi: {successes}, Fallimenti: {failures}")

if __name__ == "__main__":
    asyncio.run(main())


# import os
# import csv
# import asyncio
# import aiohttp
# import logging
# from aiohttp import ClientSession, ClientConnectorError, ClientResponseError
# from asyncio import Semaphore
# from typing import Dict, Any, Generator
# from tqdm.asyncio import tqdm_asyncio

# # Configurazione delle variabili di ambiente
# PRODUCT_RECEIVER_BASE_URL = os.getenv("PRODUCT_RECEIVER_BASE_URL", "http://localhost:3002/api")
# MAX_RETRIES = int(os.getenv("MAX_RETRIES", 5))
# BACKOFF_FACTOR = float(os.getenv("BACKOFF_FACTOR", 1.5))
# MAX_CONCURRENT_REQUESTS = int(os.getenv("MAX_CONCURRENT_REQUESTS", 100))
# CSV_FILE_PATH = os.getenv("CSV_FILE_PATH", "gros_products.csv")
# LOG_FILE = os.getenv("LOG_FILE", "send_gros_products_csv.log")
# ERROR_LOG_FILE = os.getenv("ERROR_LOG_FILE", "send_gros_products_csv_ERRORS.log")

# # Configurazione del logging
# logging.basicConfig(
#     level=logging.INFO,
#     format='%(asctime)s [%(levelname)s] %(message)s',
#     handlers=[
#         logging.FileHandler(LOG_FILE),
#         #logging.StreamHandler()
#     ]
# )
# logger = logging.getLogger(__name__)

# error_logger = logging.getLogger('error_logger')
# error_handler = logging.FileHandler(ERROR_LOG_FILE)
# error_handler.setLevel(logging.ERROR)
# formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s')
# error_handler.setFormatter(formatter)
# error_logger.addHandler(error_handler)

# async def send_product(session: ClientSession, semaphore: Semaphore, product: Dict[str, Any], retries: int = MAX_RETRIES) -> bool:
#     """
#     Invia un prodotto al endpoint /product con retry e backoff esponenziale.
    
#     Args:
#         session (ClientSession): Sessione HTTP.
#         semaphore (Semaphore): Semaforo per limitare le richieste concorrenti.
#         product (Dict[str, Any]): Dati del prodotto.
#         retries (int): Numero massimo di tentativi.
    
#     Returns:
#         bool: True se l'invio ha avuto successo, False altrimenti.
#     """
#     url = f"{PRODUCT_RECEIVER_BASE_URL}/product"
#     attempt = 0
#     print("PRODUCT_RECEIVER_BASE_URL:", PRODUCT_RECEIVER_BASE_URL)
#     while attempt < retries:
#         try:
#             async with semaphore:
#                 async with session.post(url, json=product) as response:
#                     response.raise_for_status()
#                     resp_json = await response.json()
#                     logger.info(f"Prodotto inviato con successo: {product.get('name') or product.get('full_name')}")
#                     return True
#         except (ClientConnectorError, ClientResponseError, asyncio.TimeoutError) as e:
#             attempt += 1
#             wait_time = BACKOFF_FACTOR ** attempt
#             logger.warning(f"Errore durante l'invio del prodotto '{product.get('name') or product.get('full_name')}'. Tentativo {attempt}/{retries}. Ritento tra {wait_time} secondi. Errore: {e}")
#             await asyncio.sleep(wait_time)
#         except Exception as e:
#             error_logger.error(f"Errore inatteso durante l'invio del prodotto '{product.get('name') or product.get('full_name')}': {e}")
#             return False
#     error_logger.error(f"Fallito l'invio del prodotto dopo {retries} tentativi: {product.get('name') or product.get('full_name')}")
#     return False

# def process_row(row: Dict[str, str]) -> Dict[str, Any]:
#     """
#     Processa una riga del CSV e la trasforma nel formato richiesto dall'API.
    
#     Args:
#         row (Dict[str, str]): Rappresentazione della riga del CSV.
    
#     Returns:
#         Dict[str, Any]: Dati del prodotto nel formato corretto.
#     """
#     try:
#         product = {
#             "full_name": row.get("full_name", "").strip(),
#             "name": row.get("name", "").strip(),
#             "description": row.get("description", "").strip() or None,
#             "price": float(row.get("price", 0)),
#             "discount": float(row.get("discount", 0)) if row.get("discount") else 0.0,
#             "price_for_kg": float(row.get("price_for_kg", 0)) if row.get("price_for_kg") else 0.0,
#             "localization": {
#                 "grocery": row.get("localization.grocery", "").strip(),
#                 "lat": float(row.get("localization.lat", 0)),
#                 "lng": float(row.get("localization.lng", 0))
#             },
#             "img_url": row.get("img_url", "").strip() or None
#         }
#         return product
#     except Exception as e:
#         error_logger.error(f"Errore nel processare la riga {row}: {e}")
#         return None

# async def main():
#     """
#     Funzione principale che gestisce la lettura del CSV e l'invio dei prodotti.
#     """
#     if not os.path.exists(CSV_FILE_PATH):
#         logger.error(f"File CSV non trovato: {CSV_FILE_PATH}")
#         return

#     # Conta il numero totale di righe per la barra di avanzamento
#     with open(CSV_FILE_PATH, 'r', encoding='utf-8') as f:
#         total_lines = sum(1 for _ in f) - 1  # Sottrai l'header

#     semaphore = Semaphore(MAX_CONCURRENT_REQUESTS)
#     connector = aiohttp.TCPConnector(limit=MAX_CONCURRENT_REQUESTS)
#     timeout = aiohttp.ClientTimeout(total=60)  # Timeout totale di 60 secondi

#     async with ClientSession(connector=connector, timeout=timeout) as session:
#         tasks = []
#         successes = 0
#         failures = 0

#         with open(CSV_FILE_PATH, 'r', encoding='utf-8') as csvfile:
#             reader = csv.DictReader(csvfile)
#             pbar = tqdm_asyncio(total=total_lines, desc="Invio Prodotti", unit="prodotti")
#             async for row in async_csv_reader(reader):
#                 product = process_row(row)
#                 if product:
#                     task = asyncio.create_task(send_product(session, semaphore, product))
#                     tasks.append(task)
#                 else:
#                     failures += 1
#                     pbar.update(1)
#             pbar.close()

#         for future in asyncio.as_completed(tasks):
#             result = await future
#             if result:
#                 successes += 1
#             else:
#                 failures += 1

#         logger.info(f"Invio completato. Successi: {successes}, Fallimenti: {failures}")

# async def async_csv_reader(reader: csv.DictReader) -> Generator[Dict[str, str], None, None]:
#     """
#     Lettore CSV asincrono che utilizza un thread pool per leggere le righe.
    
#     Args:
#         reader (csv.DictReader): Oggetto DictReader del modulo csv.
    
#     Yields:
#         Dict[str, str]: Righe del CSV come dizionari.
#     """
#     loop = asyncio.get_event_loop()
#     for row in reader:
#         yield row
#         await asyncio.sleep(0)  # Permette ad altre coroutine di eseguire

# if __name__ == "__main__":
#     asyncio.run(main())
