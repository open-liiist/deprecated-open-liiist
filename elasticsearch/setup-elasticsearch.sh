#!/bin/bash

# Funzione per controllare se un indice esiste
index_exists() {
  curl -s -o /dev/null -w "%{http_code}" "http://localhost:9200/$1"
}

# Funzione per controllare se un alias esiste e a quale indice punta
alias_exists_and_points_to() {
  local alias=$1
  local index=$2
  # Ottieni gli indici a cui l'alias punta
  curl -s "http://localhost:9200/_alias/$alias" | grep -q "\"$index\""
}

# Attendere che Elasticsearch sia pronto
echo "Waiting for Elasticsearch to become ready (status: green or yellow)..."
until curl -s http://localhost:9200/_cluster/health | grep -q '"status":"yellow"'; do
  if curl -s http://localhost:9200/_cluster/health | grep -q '"status":"green"'; then
    break
  fi
  echo "Elasticsearch not ready yet. Retrying in 5 seconds..."
  sleep 5
done

# Creare l'indice 'products_v2' con il mapping corretto solo se non esiste
if [ $(index_exists "products_v2") != "200" ]; then
  echo "Creating 'products_v2' index in Elasticsearch..."
  curl -X PUT "http://localhost:9200/products_v2" -H 'Content-Type: application/json' -d '
  {
    "settings": {
      "analysis": {
        "analyzer": {
          "ngram_analyzer": {
            "type": "custom",
            "tokenizer": "ngram_tokenizer",
            "filter": ["lowercase"]
          }
        },
        "tokenizer": {
          "ngram_tokenizer": {
            "type": "ngram",
            "min_gram": 3,
            "max_gram": 4,
            "token_chars": ["letter", "digit"]
          }
        }
      }
    },
    "mappings": {
      "properties": {
        "id": { "type": "integer" },
        "name": { 
          "type": "text",
          "analyzer": "ngram_analyzer",
          "fields": { 
            "keyword": { 
              "type": "keyword",
              "ignore_above": 256 
            } 
          }
        },
        "full_name": { "type": "text" },
        "description": { "type": "text" },
        "current_price": { "type": "float" },
        "discount": { "type": "float" },
        "quantity": { "type": "keyword" },
        "image_url": { "type": "keyword" },
        "price_for_kg": { "type": "float" },
        "grocery": { 
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "lat": { "type": "float" },
        "lon": { "type": "float" },
        "street": { "type": "text" },
        "city": { 
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "zip_code": { "type": "keyword" },
        "working_hours": { "type": "text" },
        "picks_up_in_store": { "type": "boolean" },
        "location": { "type": "geo_point" }
      }
    }
  }'
  echo "'products_v2' index created with the correct mapping."
else
  echo "'products_v2' index already exists. Skipping creation."
fi

# Creare l'alias 'products' che punta a 'products_v2' solo se non esiste o non punta correttamente
if ! alias_exists_and_points_to "products" "products_v2"; then
  echo "Creating alias 'products' pointing to 'products_v2'..."
  curl -X POST "http://localhost:9200/_aliases" -H 'Content-Type: application/json' -d '
  {
    "actions": [
      { "add": { "index": "products_v2", "alias": "products" } }
    ]
  }'
  echo "Alias 'products' created, pointing to 'products_v2'."
else
  echo "Alias 'products' already points to 'products_v2'. Skipping alias creation."
fi

echo "Elasticsearch setup completed successfully!"