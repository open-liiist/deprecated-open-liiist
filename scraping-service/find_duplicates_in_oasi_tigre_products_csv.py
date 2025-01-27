# find_duplicates_in_csv.py

import csv
from collections import defaultdict

def find_duplicates(csv_file):
    seen = defaultdict(int)
    with open(csv_file, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Define the key based on relevant fields
            key = (
                row.get('name', '').strip(),
                row.get('localization.grocery', '').strip(),
                row.get('localization.lat', '').strip(),
                row.get('localization.lng', '').strip()
            )
            seen[key] += 1
    
    # Filter out keys that appear more than once
    duplicates = {k: v for k, v in seen.items() if v > 1}
    return duplicates

def main():
    csv_file = 'oasi_tigre_products.csv'
    duplicates = find_duplicates(csv_file)
    if duplicates:
        print("Duplicati trovati:")
        for key, count in duplicates.items():
            print(f"{key}: {count} volte")
    else:
        print("Nessun duplicato trovato.")

if __name__ == "__main__":
    main()
