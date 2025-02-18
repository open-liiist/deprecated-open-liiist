# (Alert! Documentation Expired) Logstash Documentation
**(Alert! Documentation Expired)**  
The documentation is currently under revision and updates. Some sections may be incomplete or undergoing modifications.
This document provides an overview of the Logstash configuration, its role in the project, and how it integrates with the `product-receiver-service` to handle data ingestion and processing pipelines.

---

## Logstash Configuration

### **1. logstash/config/logstash.yml**
This file contains the default configuration for Logstash.

```yml
# Default Logstash configuration from the Logstash base image.
# https://github.com/elastic/logstash/blob/main/docker/data/logstash/config/logstash-full.yml

http.host: 0.0.0.0  # Bind Logstash to all network interfaces
node.name: logstash  # Sets the Logstash node name
```

### **2. logstash/pipeline/logstash.conf**
This file defines the pipeline used by Logstash to process incoming data. It specifies inputs, filters, and outputs.

```conf
input {
  beats {
    port => 5044  # Input for Beats agents, e.g., Filebeat
  }

  tcp {
    port => 50000  # Input for raw TCP data
    codec => json  # Decode incoming data as JSON
  }
}

# Add your filters / Logstash plugins configuration here

output {
  elasticsearch {
    hosts => "elasticsearch:9200"  # Elasticsearch endpoint
    index => "products"  # Index where data will be stored
    document_id => "%{document_id}"  # Unique identifier for upserts
    action => "update"  # Perform an update action
    doc_as_upsert => true  # Insert if the document does not exist
    user => "logstash_internal"  # Elasticsearch user
    password => "${LOGSTASH_INTERNAL_PASSWORD}"  # Password from environment
  }
}
```

### **3. logstash/.env.example**
Environment variables used by Logstash.

```env
LOGSTASH_INTERNAL_PASSWORD=changeme  # Placeholder password, replace in production
```

---

## Dockerfile for Logstash

The Logstash Dockerfile extends the official Elastic Logstash image and allows custom plugin installations if required.

```dockerfile
ARG ELASTIC_VERSION

# Use the Elastic Logstash base image
FROM docker.elastic.co/logstash/logstash:${ELASTIC_VERSION:-8.15.3}

# Add custom plugin installation commands if needed
# Example: RUN logstash-plugin install logstash-filter-json
```

---

## Docker Compose Integration

Logstash is integrated into the Docker Compose setup and configured to work with other services in the project.

### **Docker Compose Service Definition**

```yml
logstash:
  build:
    context: logstash/
    args:
      ELASTIC_VERSION: ${ELASTIC_VERSION}
  volumes:
    - ./logstash/config/logstash.yml:/usr/share/logstash/config/logstash.yml:ro,Z
    - ./logstash/pipeline:/usr/share/logstash/pipeline:ro,Z
    - logstash_data:/usr/share/logstash/data
  ports:
    - 5044:5044
    - 50000:50000/tcp
    - 50000:50000/udp
    - 9600:9600
  environment:
    LS_JAVA_OPTS: -Xmx256m -Xms256m
    LOGSTASH_INTERNAL_PASSWORD: ${LOGSTASH_INTERNAL_PASSWORD:-}
  depends_on:
    - elasticsearch
  restart: unless-stopped
```

---

## Role in the Project

Logstash is a key component in the data ingestion pipeline for the project, particularly in processing data received from the `product-receiver-service`.

### **Primary Functions**
1. **Data Ingestion**:
   - Receives data from `product-receiver-service` via TCP input on port `50000`.
   - Decodes the incoming JSON data/or similar for further processing.
   
2. **Data Transformation**:
   - The `filters` section (currently a placeholder) can be extended to enrich or transform the data (e.g., adding fields, parsing logs).

3. **Data Output**:
   - Sends processed data to Elasticsearch.
   - Uses the `products` index to store product-related data.
   - Performs an `update` action with `doc_as_upsert` enabled to ensure new documents are inserted if they don't exist.

### **Integration with product-receiver-service**
- The `product-receiver-service` forwards incoming product data to Logstash over a TCP connection. 
- Logstash parses this data, applies any necessary transformations, and upserts it into Elasticsearch.
- The Elasticsearch instance is then queried by other services (e.g., `search-service`) to provide product information.

---

## Volumes

Persistent storage is defined for Logstash data to maintain state across container restarts.

```yml
volumes:
  logstash_data:
```

---

## Summary

Logstash serves as the data processing backbone for the project, ensuring that incoming product information from the `product-receiver-service` is properly structured and indexed in Elasticsearch. This configuration supports upsert operations, real-time data ingestion, and scalability within the pipeline. Further customization can be applied to the `filters` section to meet evolving project requirements.