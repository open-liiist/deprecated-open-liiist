# For data structured similarly to a Prisma schema
import csv
from collections import defaultdict

def find_duplicates(csv_file):
    seen = defaultdict(int)
    with open(csv_file, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            key = (row.get('name_id', '').strip(), row.get('localizationId', '').strip())
            seen[key] += 1
    
    duplicates = {k: v for k, v in seen.items() if v > 1}
    return duplicates

duplicates = find_duplicates('oasi_tigre_products.csv')
if duplicates:
    print("Duplicati trovati:")
    for key, count in duplicates.items():
        print(f"{key}: {count} volte")
else:
    print("Nessun duplicato trovato.")
