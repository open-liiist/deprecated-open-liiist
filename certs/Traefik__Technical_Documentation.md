# Traefik Technical Documentation

## 1. Overview
Traefik serves as the reverse proxy, TLS terminator, and dynamic router for the liiist project. It routes external HTTP/HTTPS traffic to the appropriate backend services, provides a dashboard for monitoring, and supports both static and dynamic configuration. This documentation covers the Traefik setup as defined by the provided `traefik.yml` and `exposed-services.yml` files, as well as the role of the `/certs` directory for TLS.

## 2. Configuration Files and Directory Structure

### 2.1. Static Configuration (`traefik.yml`)
The `traefik.yml` file contains global and static settings that Traefik uses at startup. Key sections include:

- **Global Settings**
  ```yaml
  global:
    checkNewVersion: false
    sendAnonymousUsage: false
  ```
  These options disable version checks and anonymous usage data reporting.

- **API and Dashboard**
  ```yaml
  api:
    dashboard: true
    disableDashboardAd: true
    insecure: true
  ```
  The dashboard is enabled and accessible without strict security (insecure mode), which is acceptable for local development but should be secured in production.

- **Entrypoints**
  ```yaml
  entryPoints:
    web:
      address: :80
      http:
        redirections:
          entryPoint:
            to: websecure
            scheme: https
    websecure:
      address: :443
  ```
  Two entrypoints are defined:
  - **`web`** on port 80, which redirects all traffic to HTTPS.
  - **`websecure`** on port 443, which handles secured connections.

- **Providers**
  ```yaml
  providers:
    docker:
      exposedByDefault: false
    file:
      directory: /etc/traefik
      watch: true
  ```
  Traefik is configured to:
  - Discover services via Docker, but not expose all containers by default.
  - Load additional dynamic configurations from files (the directory is watched for changes).

- **Commented Certificate Resolvers and TLS Options**
  The file contains commented sections for ACME/Let's Encrypt and TLS configuration. These can be enabled for production to automate certificate issuance or to override default certificates.

### 2.2. Dynamic Configuration (`exposed-services.yml`)
The `exposed-services.yml` file provides dynamic, file-based configuration for routers, services, and TLS settings, primarily for local development.

- **TLS Certificates**
  ```yaml
  tls:
    certificates:
      - certFile: "/var/traefik/certs/local-cert.pem"
        keyFile: "/var/traefik/certs/local-key.pem"
  ```
  This section tells Traefik to use the self-signed certificate and key (mounted from the host's `/certs` directory) for TLS termination.

- **HTTP Routers and Services**
  ```yaml
  http:
    routers:
      t0-traefik:
        rule: "Host(`traefik.docker.localhost`) && PathPrefix(`/`)"
        service: "api@internal"
        tls:
          domains:
            - main: "docker.localhost"
              sans:
                - "*.docker.localhost"
        entryPoints:
          - websecure

      to-web-client:
        rule: "Host(`docker.localhost`) && PathPrefix(`/`)"
        tls:
          domains:
            - main: "docker.localhost"
              sans:
                - "*.docker.localhost"
        service: web-client
        priority: 1000
        entryPoints:
          - websecure

    services:
      web-client:
        loadBalancer:
          servers:
            - url: "http://web-client:3000"
  ```
  - **Routers:**
    - **`t0-traefik`**: Routes requests for the Traefik dashboard (using the internal API service) when the host is `traefik.docker.localhost`.
    - **`to-web-client`**: Routes requests destined for the web client service when the host is `docker.localhost`. It also specifies a high priority.
  - **TLS Configuration in Routers:**  
    Each router defines a TLS domain with a main domain and wildcard SANs to cover subdomains.
  - **Services:**  
    The `web-client` service is defined with a load balancer that forwards traffic to the backend container at `http://web-client:3000`.

### 2.3. Certificates Directory (`certs/`)
- **Purpose:**  
  The `/certs` directory holds SSL/TLS certificate files used by Traefik.
  
- **Typical Contents:**  
  - `local-cert.pem`: A self-signed certificate used for HTTPS in local development.
  - `local-key.pem`: The corresponding private key.
  
- **Usage:**  
  In the Docker Compose setup, the host’s `./certs` directory is mounted into the Traefik container at `/var/traefik/certs/`, making these certificates available for TLS termination.

## 3. Deployment via Docker Compose
Traefik is deployed as a service in the project's `docker-compose.yml` file with the following key points:

- **Volume Mounts:**
  - **Docker Socket:**  
    ```yaml
    - /var/run/docker.sock:/var/run/docker.sock:ro
    ```
    Allows Traefik to discover running Docker containers and update its routing configuration dynamically.
  
  - **Static Configuration Files:**  
    ```yaml
    - ./config/traefik.yml:/etc/traefik/traefik.yml:ro
    - ./config/conf.d/:/etc/traefik/conf.d/:ro
    ```
    These mounts provide Traefik with its static and dynamic configuration.
  
  - **Certificates:**  
    ```yaml
    - ./certs/:/var/traefik/certs/:rw
    ```
    Makes the SSL/TLS certificate files available to Traefik.

- **Port Exposures:**
  - **80** for HTTP (redirected to HTTPS)
  - **443** for HTTPS
  - **8080** for the Traefik dashboard

## 4. Certificate Management in Traefik
- **Local Development:**  
  Self-signed certificates are generated (typically manually using OpenSSL) and placed in the `certs/` directory:
  ```sh
  mkdir -p certs
  openssl req -x509 -newkey rsa:4096 -keyout certs/local-key.pem -out certs/local-cert.pem -days 365 -nodes -subj "/CN=localhost"
  ```
- **Production Considerations:**  
  Instead of using self-signed certificates, production deployments should use an automated certificate resolver (e.g., ACME with Let's Encrypt). This requires uncommenting and configuring the certificate resolver sections in `traefik.yml`.

## 5. Summary
- **Traefik** is configured with a combination of static (`traefik.yml`) and dynamic (`exposed-services.yml`) configuration files.
- The **`certs/` directory** is mounted into Traefik to supply SSL/TLS certificates for HTTPS termination.
- **Static Configuration** covers global settings, entrypoints, API/dashboard options, and providers.
- **Dynamic Configuration** defines HTTP routers, TLS settings, and services for routing traffic.
- **Deployment via Docker Compose** ensures that Traefik automatically discovers Docker services and uses the provided configurations to route and secure traffic.

This documentation outlines the complete setup and operational details of Traefik in the liiist project, ensuring that the reverse proxy and TLS termination are clearly understood and managed.