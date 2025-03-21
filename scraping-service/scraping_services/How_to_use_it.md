## Running Scraping Services

This section outlines how to run the scraping services without Docker. Due to dependencies and the requirement for a live database and product service, Docker is not recommended. CSV usage with Docker is also not feasible in this context.

**Prerequisites:**

* Python 3 installed.
* Necessary Python packages installed (refer to the project's `requirements.txt`).
* A running database and product service.

**Steps:**

1.  **Clone the Repository:**
    ```bash
    git clone <repository_url>
    cd scraping-service/scraping-services
    ```

2.  **Choose a Scraping Script:**
    * Available services:
        * `gros_groups/cts`
        * `oasi_tigre`
        * `conad`

3.  **Create the `.env` File:**
    * **`gros_groups/cts`:**
        * Create a `.env` file containing:
            ```
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your_google_maps_api_key>
            ```
    * **`oasi_tigre`:**
        * Copy the existing `.env_example` file and rename it to `.env`:
            ```bash
            cp .env_example .env
            ```
        * Then edit the .env with your specific values.
    * **`conad`:**
        * Same as `oasi_tigre`:
            ```bash
            cp .env_example .env
            ```
        * Then edit the .env with your specific values.
        * **Important:** `conad` requires human intervention to solve a CAPTCHA during execution.

4.  **Run the Shop Script:**
    * Navigate to the specific shop directory.
    * Run the `_shop.py` script:
        * For `gros_groups/cts`:
            ```bash
            python3 scraping_shop/gros_groups/cts/scraping_cts_shop.py
            ```
        * For `oasi_tigre` replace the path with the correct one.
        * For `conad` replace the path with the correct one.

5.  **Run the Scraping Script:**
    * Navigate back to the main scraping service directory.
    * Run the main scraping script:
        * For `gros_groups/cts`:
            ```bash
            python3 scraping/gros_groups/cts/scraping_cts.py
            ```
        * For `oasi_tigre` replace the path with the correct one.
        * For `conad` replace the path with the correct one.

6.  **Error Handling:**
    * The scraping script will throw an error if the receiving product service is not running. Ensure that the product service is up and running before executing the scraping script.
    * For Conad, be prepared to solve the captcha when prompted during the process.