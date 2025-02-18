## **Indice**  (Alert! Documentation Expired) 

1. [Prerequisiti](#1-prerequisiti)
2. [1. Installazione e Configurazione di Elasticsearch](#1-installazione-e-configurazione-di-elasticsearch)
3. [2. Creazione dell'Indice con Mapping Corretto](#2-creazione-dellindice-con-mapping-corretto)
4. [3. Inserimento dei Documenti](#3-inserimento-dei-documenti)
5. [4. Refresh dell'Indice](#4-refresh-dellindice)
6. [5. Querying dei Documenti](#5-querying-dei-documenti)
7. [6. Utilizzo del `search-service`](#6-utilizzo-del-search-service)
8. [7. Esempi Completi di Comandi](#7-esempi-completi-di-comandi)
9. [8. Gestione degli Errori Comuni](#8-gestione-degli-errori-comuni)
10. [9. Mapping di Campi Nested (`localization`)](#9-mapping-di-campi-nested-localization)
11. [10. Verifica Finale](#10-verifica-finale)
12. [Conclusione](#12-conclusione)

---

## **Prerequisiti**

Prima di iniziare, assicurati di avere:

- **Elasticsearch** installato e in esecuzione sulla tua macchina locale (porta predefinita: 9200).
- **`curl`** installato per eseguire comandi HTTP da terminale.
- **`search-service`** configurato correttamente e in esecuzione (porta predefinita: 4001).

---

## **1. Installazione e Configurazione di Elasticsearch**

Se non hai ancora installato Elasticsearch, ecco come farlo utilizzando Docker:

### **1.1 Installazione tramite Docker**

1. **Scarica ed esegui Elasticsearch:**

    ```bash
    docker run -d --name elasticsearch -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:8.15.0
    ```

    **Note:**
    - **`discovery.type=single-node`**: Configura Elasticsearch per funzionare in modalità single-node, ideale per sviluppo e test.
    - **Versione**: Puoi sostituire `8.15.0` con la versione desiderata, assicurandoti di utilizzare una versione compatibile con il tuo `search-service`.

2. **Verifica che Elasticsearch sia in esecuzione:**

    ```bash
    curl -X GET "http://localhost:9200/_cluster/health?pretty"
    ```

    **Risposta Attesa:**

    ```json
    {
      "cluster_name" : "docker-cluster",
      "status" : "yellow",
      "timed_out" : false,
      "number_of_nodes" : 1,
      "number_of_data_nodes" : 1,
      "active_primary_shards" : 1,
      "active_shards" : 1,
      "relocating_shards" : 0,
      "initializing_shards" : 0,
      "unassigned_shards" : 0,
      "delayed_unassigned_shards" : 0,
      "number_of_pending_tasks" : 0,
      "number_of_in_flight_fetch" : 0,
      "task_max_waiting_in_queue_millis" : 0,
      "active_shards_percent_as_number" : 100.0
    }
    ```

    **Interpretazione:**
    - **`status: "yellow"`**: Indica che il cluster è operativo ma alcune repliche non sono allocate. Per una single-node, questo è normale.

---

## **2. Creazione dell'Indice con Mapping Corretto**

Creeremo un indice chiamato `products` con un mapping dettagliato che include sia i campi principali del prodotto che quelli di `localization`.

### **2.1 Definizione del Mapping**

Il mapping definisce la struttura dei documenti nell'indice, specificando il tipo di ogni campo.

**Comando per Creare l'Indice con Mapping:**

```bash
curl -X PUT "http://localhost:9200/products" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "analysis": {
      "normalizer": {
        "lowercase_normalizer": {
          "type": "custom",
          "filter": ["lowercase"]
        }
      },
      "analyzer": {
        "whitespace_analyzer": {
          "type": "custom",
          "tokenizer": "whitespace",
          "filter": ["lowercase"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "full_name": {
        "type": "text",
        "analyzer": "whitespace_analyzer"
      },
      "name": {
        "type": "text",
        "analyzer": "whitespace_analyzer",
        "fields": {
          "keyword": {
            "type": "keyword",
            "normalizer": "lowercase_normalizer",
            "ignore_above": 256
          }
        }
      },
      "description": {
        "type": "text",
        "analyzer": "standard"
      },
      "location": {
        "type": "geo_point"
      },
      "price": {
        "type": "float"
      },
      "discount": {
        "type": "float"
      },
      "quantity": {
        "type": "keyword"
      },
      "image_url": {
        "type": "keyword"
      },
      "price_for_kg": {
        "type": "float"
      },
      "localization": {                   
        "properties": {
          "grocery": {
            "type": "text",
            "analyzer": "standard"
          },
          "lat": {
            "type": "float"
          },
          "lon": {
            "type": "float"
          },
          "street": {
            "type": "text",
            "analyzer": "standard"
          },
          "city": {
            "type": "text",
            "analyzer": "standard"
          },
          "zip_code": {
            "type": "keyword"
          },
          "working_hours": {
            "type": "text",
            "analyzer": "standard"
          },
          "picks_up_in_store": {
            "type": "boolean"
          }
        }
      }
    }
  }
}'
```

**Spiegazione dei Campi:**

- **`name`**: Campo di tipo `text` per ricerche full-text con un sotto-campo `keyword` per ricerche esatte e case-insensitive.
- **`localization`**: Campo nested che contiene dettagli sulla localizzazione del prodotto in un negozio specifico.
- **`location`**: Campo di tipo `geo_point` per supportare ricerche geografiche.
- **Altri Campi**: Specificati con i tipi appropriati (`float`, `keyword`, `text`, ecc.).

**Risposta Attesa:**

```json
{
  "acknowledged": true,
  "shards_acknowledged": true,
  "index": "products"
}
```

### **2.2 Verifica del Mapping**

Assicurati che il mapping sia stato creato correttamente.

**Comando:**

```bash
curl -X GET "http://localhost:9200/products/_mapping?pretty"
```

**Risposta Attesa:**

Il mapping dovrebbe riflettere esattamente la struttura definita sopra.

---

## **3. Inserimento dei Documenti**

Ora, inseriremo alcuni documenti nell'indice `products`. Assicurati di specificare il campo `_id` per facilitare le query future.

### **3.1 Inserimento del Primo Documento (`_id=5`)**

**Comando:**

```bash
curl -X POST "http://localhost:9200/products/_doc/5" -H 'Content-Type: application/json' -d'
{
  "name": "formaggio_grana_padano_1kg",
  "full_name": "Formaggio Grana Padano 1kg",
  "description": "Aged Grana Padano cheese.",
  "price": 12.0,
  "discount": 2.0,
  "quantity": "1kg",
  "image_url": "http://example.com/images/grana_padano_1kg.jpg",
  "price_for_kg": 12.0,
  "location": {
    "lat": 41.9028,
    "lon": 12.4964
  },
  "localization": {
    "grocery": "Esselunga Roma",
    "lat": 41.9028,
    "lon": 12.4964,
    "street": "Via del Corso, 50",
    "city": "Roma",
    "zip_code": "00186",
    "working_hours": "08:00-21:00",
    "picks_up_in_store": true
  }
}'
```

**Risposta Attesa:**

```json
{
  "_index": "products",
  "_id": "5",
  "_version": 1,
  "result": "created",
  "_shards": {
    "total": 2,
    "successful": 1,
    "failed": 0
  },
  "_seq_no": 0,
  "_primary_term": 1
}
```

### **3.2 Inserimento del Secondo Documento (`_id=6`)**

**Comando:**

```bash
curl -X POST "http://localhost:9200/products/_doc/6" -H 'Content-Type: application/json' -d'
{
  "name": "mozzarella_fresca_125g",
  "full_name": "Mozzarella fresca 125g",
  "description": "Mozzarella di latte vaccino",
  "price": 1.2,
  "discount": 0.1,
  "quantity": "125g",
  "image_url": "http://example.com/img/mozzarella.jpg",
  "price_for_kg": 9.6,
  "location": {
    "lat": 45.472,
    "lon": 9.2
  },
  "localization": {
    "grocery": "Esselunga Milano",
    "lat": 45.472,
    "lon": 9.2,
    "street": "Corso Buenos Aires 20",
    "city": "Milano",
    "zip_code": "20124",
    "working_hours": "07:30-22:00",
    "picks_up_in_store": false
  }
}'
```

**Risposta Attesa:**

```json
{
  "_index": "products",
  "_id": "6",
  "_version": 1,
  "result": "created",
  "_shards": {
    "total": 2,
    "successful": 1,
    "failed": 0
  },
  "_seq_no": 1,
  "_primary_term": 1
}
```

---

## **4. Refresh dell'Indice**

Per rendere immediatamente disponibili i documenti appena inseriti nelle ricerche, esegui un refresh dell'indice.

**Comando:**

```bash
curl -X POST "http://localhost:9200/products/_refresh"
```

**Risposta Attesa:**

```json
{
  "_shards": {
    "total": 2,
    "successful": 1,
    "failed": 0
  }
}
```

---

## **5. Querying dei Documenti**

Ora possiamo eseguire query per recuperare i documenti indicizzati.

### **5.1 Ricerca di un Documento per `name.keyword`**

**Esempio 1: Ricerca del Documento con `name.keyword = "formaggio_grana_padano_1kg"`**

**Comando:**

```bash
curl -X GET "http://localhost:9200/products/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "term": {
      "name.keyword": "formaggio_grana_padano_1kg"
    }
  }
}'
```

**Risposta Attesa:**

```json
{
  "took" : 9,
  "timed_out" : false,
  "_shards" : { ... },
  "hits" : {
    "total" : { "value" : 1, "relation" : "eq" },
    "max_score" : 0.6931471,
    "hits" : [
      {
        "_index" : "products",
        "_id" : "5",
        "_score" : 0.6931471,
        "_source" : { ... }
      }
    ]
  }
}
```

**Esempio 2: Ricerca del Documento con `name.keyword = "mozzarella_fresca_125g"`**

**Comando:**

```bash
curl -X GET "http://localhost:9200/products/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "term": {
      "name.keyword": "mozzarella_fresca_125g"
    }
  }
}'
```

**Risposta Attesa:**

```json
{
  "took" : 5,
  "timed_out" : false,
  "_shards" : { ... },
  "hits" : {
    "total" : { "value" : 1, "relation" : "eq" },
    "max_score" : 0.6931471,
    "hits" : [
      {
        "_index" : "products",
        "_id" : "6",
        "_score" : 0.6931471,
        "_source" : { ... }
      }
    ]
  }
}
```

### **5.2 Ricerca con Query Full-Text**

Puoi eseguire ricerche più flessibili utilizzando query `match` o `multi_match` per cercare termini all'interno di campi di tipo `text`.

**Esempio: Ricerca per "mozzarella" nel campo `description`**

**Comando:**

```bash
curl -X GET "http://localhost:9200/products/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match": {
      "description": "mozzarella"
    }
  }
}'
```

**Risposta Attesa:**

Il documento relativo alla mozzarella dovrebbe essere restituito.

---

## **6. Utilizzo del `search-service`**

Assumendo che il tuo `search-service` sia configurato per interagire con Elasticsearch, ecco come testarlo.

### **6.1 Verifica delle API del `search-service`**

Supponiamo che il tuo `search-service` abbia gli endpoint:

- **`/search`**: Ricerca generale.
- **`/product/exists`**: Verifica l'esistenza di un prodotto.
- **`/product/in-shop`**: Verifica se un prodotto è disponibile in un negozio specifico.
- **`/product/lowest-price`**: Trova il prezzo più basso tra i negozi.

### **6.2 Esempio di Richieste all'API**

#### **6.2.1 Endpoint `/search`**

**Ricerca per "mozzarella":**

**Comando:**

```bash
curl -X GET "http://localhost:4001/search?query=mozzarella" -H 'Content-Type: application/json'
```

**Risposta Attesa:**

```json
{
  "most_similar": [
    {
      "_id": "6",
      "name": "mozzarella_fresca_125g",
      "full_name": "Mozzarella fresca 125g",
      "description": "Mozzarella di latte vaccino",
      "price": 1.2,
      "discount": 0.1,
      "localization": {
        "grocery": "Esselunga Milano",
        "lat": 45.472,
        "lon": 9.2
      },
      "distance": null
    }
  ],
  "lowest_price": [
    {
      "_id": "6",
      "name": "mozzarella_fresca_125g",
      "full_name": "Mozzarella fresca 125g",
      "description": "Mozzarella di latte vaccino",
      "price": 1.2,
      "discount": 0.1,
      "localization": {
        "grocery": "Esselunga Milano",
        "lat": 45.472,
        "lon": 9.2
      },
      "distance": null
    }
  ]
}
```

#### **6.2.2 Endpoint `/product/exists`**

**Verifica se "mozzarella_fresca_125g" esiste vicino a una posizione specifica:**

**Comando:**

```bash
curl -X POST "http://localhost:4001/product/exists" -H 'Content-Type: application/json' -d'
{
  "product": "mozzarella_fresca_125g",
  "position": {
    "latitude": 45.472,
    "longitude": 9.2
  }
}'
```

**Risposta Attesa:**

```json
{
  "product": "mozzarella_fresca_125g",
  "exists": true,
  "details": {
    "_id": "6",
    "name": "mozzarella_fresca_125g",
    "full_name": "Mozzarella fresca 125g",
    "description": "Mozzarella di latte vaccino",
    "price": 1.2,
    "discount": 0.1,
    "localization": {
      "grocery": "Esselunga Milano",
      "lat": 45.472,
      "lon": 9.2
    },
    "distance": 0.0
  }
}
```

#### **6.2.3 Endpoint `/product/lowest-price`**

**Trova il prezzo più basso per una lista di prodotti:**

**Comando:**

```bash
curl -X POST "http://localhost:4001/product/lowest-price" -H 'Content-Type: application/json' -d'
{
  "products": [
    "formaggio_grana_padano_1kg",
    "mozzarella_fresca_125g"
  ],
  "position": {
    "latitude": 41.9028,
    "longitude": 12.4964
  },
  "mode": "savings"
}'
```

**Risposta Attesa:**

```json
[
  {
    "shop": "Esselunga Roma + Esselunga Milano",
    "total_price": 13.2,
    "products": [
      {
        "shop": "Esselunga Roma",
        "name": "formaggio_grana_padano_1kg",
        "description": "Aged Grana Padano cheese.",
        "price": 12.0,
        "discount": 2.0,
        "distance": 0.0
      },
      {
        "shop": "Esselunga Milano",
        "name": "mozzarella_fresca_125g",
        "description": "Mozzarella di latte vaccino",
        "price": 1.2,
        "discount": 0.1,
        "distance": 0.0
      }
    ]
  }
]
```

**Nota:** La logica del `search-service` dovrebbe aggregare i prezzi dai negozi più vicini per fornire la combinazione migliore in termini di risparmio.

---

## **7. Esempi Completi di Comandi**

Riassumiamo tutti i comandi chiave necessari per interagire con Elasticsearch e il tuo `search-service`.

### **7.1 Creazione dell'Indice con Mapping**

```bash
curl -X PUT "http://localhost:9200/products" -H 'Content-Type: application/json' -d'
{
  "settings": { ... },
  "mappings": { ... }
}'
```

### **7.2 Inserimento di Documenti**

**Documento 1 (`_id=5`):**

```bash
curl -X POST "http://localhost:9200/products/_doc/5" -H 'Content-Type: application/json' -d'
{
  "name": "formaggio_grana_padano_1kg",
  ...
}'
```

**Documento 2 (`_id=6`):**

```bash
curl -X POST "http://localhost:9200/products/_doc/6" -H 'Content-Type: application/json' -d'
{
  "name": "mozzarella_fresca_125g",
  ...
}'
```

### **7.3 Refresh dell'Indice**

```bash
curl -X POST "http://localhost:9200/products/_refresh"
```

### **7.4 Verifica dei Documenti**

**Verifica per `_id=5`:**

```bash
curl -X GET "http://localhost:9200/products/_doc/5?pretty"
```

**Verifica per `_id=6`:**

```bash
curl -X GET "http://localhost:9200/products/_doc/6?pretty"
```

### **7.5 Query di Ricerca per `name.keyword`**

**Ricerca per "formaggio_grana_padano_1kg":**

```bash
curl -X GET "http://localhost:9200/products/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "term": {
      "name.keyword": "formaggio_grana_padano_1kg"
    }
  }
}'
```

**Ricerca per "mozzarella_fresca_125g":**

```bash
curl -X GET "http://localhost:9200/products/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "term": {
      "name.keyword": "mozzarella_fresca_125g"
    }
  }
}'
```

### **7.6 Utilizzo del `search-service`**

**Esempio: Ricerca Generale**

```bash
curl -X GET "http://localhost:4001/search?query=mozzarella" -H 'Content-Type: application/json'
```

**Esempio: Verifica Esistenza di un Prodotto**

```bash
curl -X POST "http://localhost:4001/product/exists" -H 'Content-Type: application/json' -d'
{
  "product": "mozzarella_fresca_125g",
  "position": {
    "latitude": 45.472,
    "longitude": 9.2
  }
}'
```

**Esempio: Trova Prezzo Più Basso**

```bash
curl -X POST "http://localhost:4001/product/lowest-price" -H 'Content-Type: application/json' -d'
{
  "products": [
    "formaggio_grana_padano_1kg",
    "mozzarella_fresca_125g"
  ],
  "position": {
    "latitude": 41.9028,
    "longitude": 12.4964
  },
  "mode": "savings"
}'
```

---

## **8. Gestione degli Errori Comuni**

### **8.1 Errore 406 Not Acceptable**

**Messaggio di Errore:**

```json
{
  "error" : "Content-Type header [application/x-www-form-urlencoded] is not supported",
  "status" : 406
}
```

**Causa:**

- **Mancanza dell'Header `Content-Type: application/json`** nelle richieste che inviano dati nel corpo (`-d`).

**Soluzione:**

- **Sempre Specificare `Content-Type: application/json`** quando invii dati JSON.

**Esempio Corretto:**

```bash
curl -X GET "http://localhost:9200/products/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "term": {
      "name.keyword": "mozzarella_fresca_125g"
    }
  }
}'
```

### **8.2 Documenti Non Riconosciuti nella Ricerca**

**Possibili Cause:**

1. **Documenti Non Indicizzati Correttamente:**
   - Verifica che i documenti siano presenti tramite `_doc/_id`.
   - Assicurati di aver eseguito un `refresh` dopo l'inserimento.

2. **Mapping Inadeguato:**
   - Verifica che i campi siano correttamente tipizzati.
   - Assicurati che i campi di ricerca (`name.keyword`) esistano nel mapping.

3. **Richieste di Query Errate:**
   - Controlla che la query corrisponda al mapping.
   - Utilizza i campi corretti (`name.keyword` anziché `name`).

### **8.3 Problemi di Connessione tra `search-service` ed Elasticsearch**

**Causa Comune:**

- **URL di Connessione Errato:**
  - Assicurati che il `search-service` punti all'URL corretto di Elasticsearch (`http://localhost:9200`).

**Verifica:**

- **Controlla i Log del `search-service`:**

    ```bash
    docker logs -f <nome_del_container_search_service>
    ```

- **Esegui una Query di Test dal `search-service`:**

    Implementa una funzione di test nel tuo codice Rust per eseguire una query semplice e verificare la risposta.

---

## **9. Mapping di Campi Nested (`localization`)**

Nel mapping definito, il campo `localization` è un oggetto che contiene vari sottocampi. È importante che questi sottocampi siano correttamente mappati per supportare ricerche e filtri.

### **9.1 Mapping già Definito**

Nel mapping creato in [Sezione 2.1](#21-definizione-del-mapping), il campo `localization` è già definito con i sottocampi appropriati:

```json
"localization": {                   
  "properties": {
    "grocery": {
      "type": "text",
      "analyzer": "standard"
    },
    "lat": {
      "type": "float"
    },
    "lon": {
      "type": "float"
    },
    "street": {
      "type": "text",
      "analyzer": "standard"
    },
    "city": {
      "type": "text",
      "analyzer": "standard"
    },
    "zip_code": {
      "type": "keyword"
    },
    "working_hours": {
      "type": "text",
      "analyzer": "standard"
    },
    "picks_up_in_store": {
      "type": "boolean"
    }
  }
}
```

### **9.2 Querying Campi Nested**

Per eseguire ricerche sui campi nested, utilizza la query `nested`.

**Esempio: Ricerca di Prodotti in un Negozio Specifico**

Supponiamo di voler trovare tutti i prodotti disponibili in "Esselunga Milano".

**Comando:**

```bash
curl -X GET "http://localhost:9200/products/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "nested": {
      "path": "localization",
      "query": {
        "bool": {
          "must": [
            { "match": { "localization.grocery": "Esselunga Milano" } }
          ]
        }
      }
    }
  }
}'
```

**Risposta Attesa:**

Dovresti ricevere i documenti che hanno `localization.grocery` uguale a "Esselunga Milano".

---

## **10. Verifica Finale**

Dopo aver seguito tutti i passaggi, esegui le seguenti verifiche per assicurarti che tutto funzioni correttamente.

### **10.1 Verifica dei Documenti Indicizzati**

**Verifica per `_id=5`:**

```bash
curl -X GET "http://localhost:9200/products/_doc/5?pretty"
```

**Verifica per `_id=6`:**

```bash
curl -X GET "http://localhost:9200/products/_doc/6?pretty"
```

### **10.2 Esecuzione di Query di Ricerca**

**Ricerca per "formaggio_grana_padano_1kg":**

```bash
curl -X GET "http://localhost:9200/products/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "term": {
      "name.keyword": "formaggio_grana_padano_1kg"
    }
  }
}'
```

**Ricerca per "mozzarella_fresca_125g":**

```bash
curl -X GET "http://localhost:9200/products/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "term": {
      "name.keyword": "mozzarella_fresca_125g"
    }
  }
}'
```

### **10.3 Test delle API del `search-service`**

**Ricerca Generale:**

```bash
curl -X GET "http://localhost:4001/search?query=mozzarella" -H 'Content-Type: application/json'
```

**Verifica Esistenza di un Prodotto:**

```bash
curl -X POST "http://localhost:4001/product/exists" -H 'Content-Type: application/json' -d'
{
  "product": "mozzarella_fresca_125g",
  "position": {
    "latitude": 45.472,
    "longitude": 9.2
  }
}'
```

**Trova Prezzo Più Basso:**

```bash
curl -X POST "http://localhost:4001/product/lowest-price" -H 'Content-Type: application/json' -d'
{
  "products": [
    "formaggio_grana_padano_1kg",
    "mozzarella_fresca_125g"
  ],
  "position": {
    "latitude": 41.9028,
    "longitude": 12.4964
  },
  "mode": "savings"
}'
```

---

## **Conclusione**

Questa guida step-by-step, ha lo scopo di guidare nel configurare correttamente il  **search-service** con Elasticsearch, creare indici con mapping appropriati, inserire e interrogare documenti, e gestire eventuali errori comuni. Riepilogo:

1. **Mapping Corretto:** Assicurati che tutti i campi siano mappati correttamente, inclusi i campi nested come `localization`.
2. **Headers HTTP Adeguati:** Sempre specificare `Content-Type: application/json` quando si inviano dati JSON nelle richieste.
3. **Refresh dell'Indice:** Esegui un refresh dopo l'inserimento dei documenti per renderli immediatamente ricercabili.
4. **Verifica dei Documenti:** Usa le API di Elasticsearch per confermare che i documenti siano presenti e correttamente indicizzati.
5. **Log Dettagliati nel `search-service`:** Implementa log dettagliati per monitorare le richieste e le risposte tra il servizio e Elasticsearch.
6. **Test Completi:** Esegui test completi delle API del tuo servizio per assicurarti che tutto funzioni come previsto.
