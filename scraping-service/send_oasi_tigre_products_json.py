#/scraping-service/send_oasi_tigre_products_json.py
#Status: Working
import os
import time
import json
import logging
import requests
from typing import Optional
from requests.exceptions import RequestException, HTTPError
from concurrent.futures import ThreadPoolExecutor, as_completed

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("send_oasi_tigre_products_json.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

error_logger = logging.getLogger('error_logger')
error_handler = logging.FileHandler('send_oasi_tigre_products_json_errors.log')
error_handler.setLevel(logging.ERROR)
formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s')
error_handler.setFormatter(formatter)
error_logger.addHandler(error_handler)

PRODUCT_RECEIVER_BASE_URL = os.getenv("PRODUCT_RECEIVER_BASE_URL", "http://localhost:3002/api")
PRODUCT_ENDPOINT = "product"  # endpoint /api/product
MAX_RETRIES = int(os.getenv("MAX_RETRIES", 3))
BACKOFF_FACTOR = int(os.getenv("BACKOFF_FACTOR", 2))
MAX_THREADS = int(os.getenv("MAX_THREADS", 20))

def wait_for_service(endpoint: str, timeout: int = 60) -> None:
    """
    Attende che /health risponda 200 OK entro 'timeout' secondi.
    """
    url = f"{PRODUCT_RECEIVER_BASE_URL}/{endpoint}"
    logger.info(f"Attendo che il servizio {url} sia pronto...")
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            response = requests.get(url)
            if response.status_code == 200:
                logger.info(f"Servizio {url} è pronto.")
                return
        except RequestException:
            pass
        logger.debug("Servizio non ancora pronto. Attendo 5s...")
        time.sleep(5)
    msg = f"Servizio {url} non pronto entro {timeout}s."
    error_logger.error(msg)
    raise TimeoutError(msg)

def send_item_to_api(item: dict, session: requests.Session) -> bool:
    """
    Invia un singolo record (prodotto) a /product con retry su errori 5xx o di rete.
    Se 4xx => non ritento.
    """
    url = f"{PRODUCT_RECEIVER_BASE_URL}/{PRODUCT_ENDPOINT}"
    attempt = 0
    while attempt < MAX_RETRIES:
        try:
            logger.debug(f"Invio prodotto a {url}: {json.dumps(item, ensure_ascii=False)}")
            response = session.post(url, json=item)
            response.raise_for_status()
            logger.info(f"Inviato con successo: {item.get('name')}")
            return True

        except HTTPError as http_err:
            status_code = response.status_code
            # 4xx => non ritento
            if 400 <= status_code < 500:
                logger.error(f"[4xx] Errore client per '{item.get('name')}': {status_code}. Non ritento.")
                error_logger.error(f"[4xx] Dettagli: {response.text}")
                return False
            # 5xx => ritento
            attempt += 1
            wait = BACKOFF_FACTOR ** attempt
            logger.warning(
                f"Tentativo {attempt}/{MAX_RETRIES} per '{item.get('name')}': {http_err}. "
                f"Riprovo tra {wait}s."
            )
            error_logger.error(f"Errore 5xx: {response.text}")
            time.sleep(wait)

        except RequestException as e:
            # Altri errori di rete
            attempt += 1
            wait = BACKOFF_FACTOR ** attempt
            logger.warning(
                f"Errore di rete (tentativo {attempt}/{MAX_RETRIES}) per '{item.get('name')}': {e}. "
                f"Riprovo tra {wait}s."
            )
            error_logger.error(f"Errore rete: {e}")
            time.sleep(wait)

    msg = f"Fallito l'invio di '{item.get('name')}' dopo {MAX_RETRIES} tentativi."
    logger.error(msg)
    error_logger.error(msg)
    return False

def validate_and_prepare_product_data(product: dict) -> Optional[dict]:
    """
    Controlla i campi minimi: price, localization, img_url, e almeno uno tra name e full_name.
    Converte discount > 1 => clamp a 1.0
    """
    required_fields = ["price", "localization", "img_url"]
    missing = [f for f in required_fields if not product.get(f)]
    if missing:
        logger.warning(f"Mancano i campi {missing} nel prodotto: {product}")
        return None

    name = product.get("name", "").strip()
    full_name = product.get("full_name", "").strip()
    if not name and not full_name:
        logger.warning(f"Scartato prodotto per mancanza di name e full_name: {product}")
        return None

    # Se manca name ma c'è full_name => name = full_name
    if not name and full_name:
        product["name"] = full_name
    # Se manca full_name ma c'è name => full_name = name
    elif name and not full_name:
        product["full_name"] = name

    # price
    try:
        product["price"] = float(product["price"])
    except (ValueError, TypeError):
        logger.warning(f"Price non convertibile: {product}")
        return None

    # discount => clamp <= 1.0
    try:
        product["discount"] = float(product.get("discount", 0.0))
    except (ValueError, TypeError):
        product["discount"] = 0.0
    if product["discount"] > 1.0:
        product["discount"] = 1.0

    # price_for_kg
    try:
        product["price_for_kg"] = float(product.get("price_for_kg", 0.0))
    except (ValueError, TypeError):
        product["price_for_kg"] = 0.0

    # Rinomina 'long'->'lng'
    loc = product["localization"]
    if "long" in loc:
        loc["lng"] = loc.pop("long")

    # Converte lat/lng
    try:
        loc["lat"] = float(loc["lat"])
        loc["lng"] = float(loc["lng"])
    except (ValueError, TypeError, KeyError):
        logger.warning(f"Localizzazione non valida: {product}")
        return None

    if not loc.get("grocery"):
        logger.warning(f"Grocery mancante: {product}")
        return None

    product["localization"] = {
        "grocery": loc["grocery"].strip(),
        "lat": loc["lat"],
        "lng": loc["lng"]
    }

    product["description"] = product.get("description", "").strip()
    if "quantity" in product:
        product["quantity"] = str(product["quantity"]).strip()
    product["img_url"] = str(product["img_url"]).strip()

    return product

def load_and_send(file_path: str):
    logger.info(f"Processo il file: {file_path}")
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        logger.error(f"Errore lettura/parsing {file_path}: {e}")
        error_logger.error(e)
        return

    valid_count = 0
    skipped_count = 0

    with requests.Session() as session, ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
        futures = []

        for raw_prod in data:
            if not raw_prod:
                skipped_count += 1
                continue

            product = validate_and_prepare_product_data(raw_prod)
            if product is None:
                skipped_count += 1
                continue

            futures.append(executor.submit(send_item_to_api, product, session))

        for future in as_completed(futures):
            if future.result():
                valid_count += 1

    logger.info(f"Inviati con successo: {valid_count}, scartati: {skipped_count} dal file {file_path}.")

def main():
    # Esempio JSON (array):
    # [
    #   {
    #     "name": "Treccine patate e rosmarino 400 gr",
    #     "full_name": "Treccine patate e rosmarino 400 gr",
    #     "img_url": "https://...jpg",
    #     "description": "",
    #     "price": 2.35,
    #     "discount": 1.89,  # --> verrà clampato a 1.0
    #     "price_for_kg": 0.0,
    #     "localization": {
    #       "grocery": "Supermercato Tigre",
    #       "lat": 41.959978,
    #       "lng": 12.5351033
    #     }
    #   },
    #   ...
    # ]
    files_to_send = ["oasi_tigre_products.json"]

    try:
        wait_for_service("health", 60)
    except TimeoutError as e:
        error_logger.error(e)
        logger.error(e)
        return

    for fp in files_to_send:
        load_and_send(fp)

if __name__ == "__main__":
    main()


# ESEMPI DI JSON (array):
# [
#   {
#     "name": "Banane bio Consilia confezione 600gr",
#     "full_name": "Banane bio Consilia confezione 600gr",
#     "img_url": "https://www.oasitigre.it/content/banane.jpg",
#     "description": "Banane biologiche",
#     "price": 1.73,
#     "discount": 0.0,
#     "price_for_kg": 0.0,
#     "localization": {
#       "grocery": "Supermercato Tigre",
#       "lat": 41.8412735,
#       "long": 12.8720899
#     }
#   },
#   {
#     "price": 2.5,
#     "localization": {
#       "grocery": "Supermercato Tigre",
#       "lat": "abc",
#       "lng": 12.8720899
#     },
#     "img_url": "https://www.oasitigre.it/content/invalid.jpg"
#   }
# ]
# Il secondo è un esempio di prodotto NON VALIDO (lat=abc).



    # Esempio di prodotto NON VALIDO:
    # {
    #     "name": "",
    #     "full_name": "",
    #     "img_url": "https://www.oasitigre.it/content/dam/oasitigre/products/39/82/6/5/main/jcr:content/renditions/main-360x360.jpeg",
    #     "description": "",
    #     "price": 0.0,
    #     "discount": 0.0,
    #     "localization": {
    #         "grocery": "Supermercato Tigre",
    #         "lat": 41.9215852,
    #         "long": 12.4943683
    #     },
    #     "price_for_kg": 0
    # },
    
    # Esempio di prodotto VALIDO:
    # {
    #     "name": "Banane bio Consilia confezione 600gr circa",
    #     "full_name": "Banane bio Consilia confezione 600gr circa",
    #     "img_url": "https://www.oasitigre.it/content/dam/oasitigre/products/68/51/8/5/main/jcr:content/renditions/main-360x360.jpeg",
    #     "description": "Banane biologiche",
    #     "price": 1.73,
    #     "discount": 0.0,
    #     "localization": {
    #         "grocery": "Supermercato Tigre",
    #         "lat": 41.8412735,
    #         "long": 12.8720899
    #     },
    #     "price_for_kg": 0
    # },
