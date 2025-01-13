import json
import glob

# Pattern per cercare tutti i file JSON nella stessa cartella
file_list = glob.glob("*.json")

# Lista per contenere tutti i dati
merged_data = []

# Leggere ogni file e aggiungere i dati alla lista
for file_path in file_list:
    with open(file_path, 'r') as file:
        data = json.load(file)  # Legge il contenuto del file JSON
        if isinstance(data, list):  # Se il file contiene una lista di oggetti
            merged_data.extend(data)
        else:  # Se il file contiene un singolo oggetto
            merged_data.append(data)

# Scrivere tutti i dati uniti in un nuovo file JSON
with open("all_oasi_tigre.json", 'w') as output_file:
    json.dump(merged_data, output_file, indent=4, ensure_ascii=False)

print("Tutti i file JSON nella cartella sono stati uniti correttamente in 'merged.json'!")
