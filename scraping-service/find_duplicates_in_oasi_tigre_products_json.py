#find_duplicates_in_oasi_tigre_products_json
import json
from collections import defaultdict
import logging
import sys

def setup_logging(duplicates_log_file):
    """
    Configura il logging per registrare i duplicati in un file specificato.
    """
    logger = logging.getLogger('duplicates_logger')
    logger.setLevel(logging.INFO)

    # Crea un handler per il file di log
    fh = logging.FileHandler(duplicates_log_file)
    fh.setLevel(logging.INFO)

    # Crea un formatter e lo aggiunge all'handler
    formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s')
    fh.setFormatter(formatter)

    # Aggiunge l'handler al logger
    logger.addHandler(fh)

    return logger

def find_duplicates(json_file, key_fields):
    """
    Identifica le voci duplicate in un file JSON basandosi sui campi specificati.

    Parametri:
    - json_file (str): Percorso al file JSON.
    - key_fields (list of str): Lista dei campi da considerare per identificare i duplicati.

    Ritorna:
    - duplicates (dict): Dizionario dove le chiavi sono tuple di valori dei campi e i valori sono i conteggi delle occorrenze.
    """
    seen = defaultdict(int)
    duplicates = defaultdict(int)

    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if not isinstance(data, list):
                print(f"Errore: Il file JSON {json_file} non contiene una lista di voci.")
                sys.exit(1)
            
            for entry in data:
                # Estrae i valori per i campi chiave specificati
                key = []
                for field in key_fields:
                    parts = field.split('.')
                    value = entry
                    try:
                        for part in parts:
                            value = value[part]
                    except (KeyError, TypeError):
                        value = None
                        break
                    # Converte None in stringa vuota e rimuove gli spazi
                    key.append(str(value).strip() if value is not None else '')
                key_tuple = tuple(key)
                seen[key_tuple] += 1
                if seen[key_tuple] > 1:
                    duplicates[key_tuple] += 1

    except FileNotFoundError:
        print(f"Errore: File {json_file} non trovato.")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Errore: Impossibile parsare il file JSON {json_file}: {e}")
        sys.exit(1)

    return duplicates

def main():
    # Specifica direttamente il percorso del file JSON e del file di log
    json_file = 'oasi_tigre_products.json'  # Inserisci qui il percorso corretto del tuo file JSON
    duplicates_log_file = 'duplicate_json_tigre_Products.log'  # Inserisci qui il percorso desiderato per il file di log

    # Definisce i campi da considerare per i duplicati
    key_fields = [
        'name',
        'localization.grocery',
        'localization.lat',
        'localization.lng'
    ]

    # Configura il logger
    logger = setup_logging(duplicates_log_file)

    # Trova i duplicati
    duplicates = find_duplicates(json_file, key_fields)

    # Calcola il totale dei duplicati e delle combinazioni uniche duplicate
    total_duplicates = sum(duplicates.values())
    unique_duplicate_keys = len(duplicates)

    # Stampa i risultati e registra i duplicati nel file di log
    if duplicates:
        print(f"Duplicati trovati: {total_duplicates} duplicati su {unique_duplicate_keys} combinazioni uniche.")
        for key, count in duplicates.items():
            print(f"{key}: {count + 1} volte")
            logger.info(f"Duplicate key: {key} - Occurrences: {count + 1}")
    else:
        print("Nessun duplicato trovato.")

if __name__ == "__main__":
    main()
