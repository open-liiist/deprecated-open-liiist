#!/bin/bash

# Wait for Elasticsearch to start
echo "Waiting for Elasticsearch to become ready (status: green or yellow)..."
until curl -s http://elasticsearch:9200/_cluster/health | grep -q '"status":"yellow"'; do
  if curl -s http://elasticsearch:9200/_cluster/health | grep -q '"status":"green"'; then
    break
  fi
  echo "Elasticsearch not ready yet. Retrying in 5 seconds..."
  sleep 5
done

# curl -X PUT "localhost:9200/products" -H 'Content-Type: application/json' -d'
curl -X PUT "http://elasticsearch:9200/products" -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "properties": {
      "location": {
        "type": "geo_point"
      }
    }
  }
}
'

echo "Index with geo_point created successfully!"
