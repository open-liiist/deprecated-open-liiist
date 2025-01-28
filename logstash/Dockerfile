FROM docker.elastic.co/logstash/logstash:8.15.3

# Passa all'utente root per eseguire operazioni di sistema
USER root

# Crea la directory per i driver
RUN mkdir -p /usr/share/logstash/drivers

# Copia il driver JDBC di PostgreSQL nel container
COPY drivers/postgresql-42.5.4.jar /usr/share/logstash/drivers/

# Imposta i permessi corretti sul file JAR
RUN chmod 644 /usr/share/logstash/drivers/postgresql-42.5.4.jar \
    && chown logstash:logstash /usr/share/logstash/drivers/postgresql-42.5.4.jar

# Torna all'utente logstash per eseguire Logstash
USER logstash


# ARG ELASTIC_VERSION

# # https://www.docker.elastic.co/
# FROM docker.elastic.co/logstash/logstash:${ELASTIC_VERSION:-8.15.3}

# # Add your logstash plugins setup here
# # Example: RUN logstash-plugin install logstash-filter-json

# # Install Logstash JDBC Input Plugin
# #RUN logstash-plugin install logstash-input-jdbc

# # Install PostgreSQL JDBC Driver
# RUN mkdir -p /usr/share/logstash/drivers
# ADD https://jdbc.postgresql.org/download/postgresql-42.5.4.jar /usr/share/logstash/drivers/
# RUN chmod 644 /usr/share/logstash/drivers/postgresql-42.5.4.jar \
#     && chown logstash:logstash /usr/share/logstash/drivers/postgresql-42.5.4.jar

