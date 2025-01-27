#!/bin/bash

# Attendi che Elasticsearch sia pronto
echo "Attendere che Elasticsearch sia pronto..."
until curl -s http://localhost:9200/_cluster/health | grep -q '"status":"green"\|"status":"yellow"'; do
  echo "Elasticsearch non è ancora pronto. Riprovo tra 5 secondi..."
  sleep 5
done

echo "Elasticsearch è pronto. Creazione dell'indice 'products' con il mapping..."

# Crea l'indice 'products' con il mapping
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

echo "Indice 'products' creato con successo!"



# #!/bin/bash
# #elasticsearch/setup-elasticsearch.sh
# # Wait for Elasticsearch to start
# echo "Waiting for Elasticsearch to become ready (status: green or yellow)..."
# until curl -s http://elasticsearch:9200/_cluster/health | grep -q '"status":"yellow"'; do
#   if curl -s http://elasticsearch:9200/_cluster/health | grep -q '"status":"green"'; then
#     break
#   fi
#   echo "Elasticsearch not ready yet. Retrying in 5 seconds..."
#   sleep 5
# done

# # curl -X PUT "localhost:9200/products" -H 'Content-Type: application/json' -d'
# curl -X PUT "http://elasticsearch:9200/products" -H 'Content-Type: application/json' -d'
# {
#   "mappings": {
#     "properties": {
#       "location": {
#         "type": "geo_point"
#       }
#     }
#   }
# }
# '

# echo "Index with geo_point created successfully!"
