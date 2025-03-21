## Adding a New Shop

This section describes the process of adding a new shop to the scraping service.

**1. Create Shop Folders:**

* Create a new folder within `scraping_shop` and `scraping` directories, using the chosen shop's name.
* For shops with a "chain" structure (e.g., Catena), create an additional subfolder named `shop` inside the newly created shop folder.

    ```
    scraping-service/scraping-services/
    ├── scraping_shop/
    │   └── new_shop_name/
    │       └── shop/ (if applicable)
    ├── scraping/
    │   └── new_shop_name/
    │       └── shop/ (if applicable)

    ```

**2. Locate Shop Information:**

* Identify the best method to obtain shop location data (street, latitude, longitude).
* **Preferred Method (API):**
    * Use browser developer tools (Network tab, XHR requests) to search for the shop's API.
    * If an API exists, use it to retrieve shop location information.
* **Fallback Method (Web Scraping):**
    * If an API is not available, use `undetected_chromedriver` to load the shop's website and extract the necessary information.
* **Geocoding:**
    * For both methods, you may need to use geocoding services to convert addresses to latitude and longitude, or vice versa, to get street information.

**3. Store Data Formatting:**

* Ensure the collected shop data conforms to the following `storeSchema` (using `zod`):

    ```typescript
    const storeSchema = z.object({
        name: z.string().min(1, 'name is required'),
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        street: z.string().nullable().optional(),
        city: z.string().optional(),
        working_hours: z.string().optional(),
        picks_up_in_shop: z.boolean().optional(),
        zip_code: z.string().optional(),
    });
    ```

**4. Data Persistence:**

* Send the formatted shop data to the database using the `create_store()` function.
* If `create_store()` returns `None` (indicating an issue), use `write_list_of_dicts_to_csv()` to save the data to a CSV file as a backup.

**5. Product Scraping:**

* Develop the product scraping logic within the `scraping` folder.
* Ensure the scraped product data conforms to the following `productSchema` (using `zod`):

    ```typescript
    const productSchema = z.object({
        full_name: z.string().min(1, 'full_name is required'),
        nome: z.string().optional(),
        descrizione: z.string().nullable().optional(),
        prezzo: z.number().min(0),
        sconto: z.number().min(0).optional(),
        quantità: z.string().nullable().optional(),
        img_url: z.string().url().optional(),
        prezzo_per_kg: z.number().min(0).optional(),
        localizzazione: z.object({
            grocery: z.string().min(1, 'grocery è richiesto'),
            lat: z.number().min(-90).max(90),
            lng: z.number().min(-180).max(180),
            street: z.string().min(1, 'street is required'),
        }),
    });
    ```

**6. Send Product Data:**

* Send the scraped product data to the database using the `send_data_to_receiver()` function.
* **Important:** Always attempt to use the API method first for retrieving shop information, as it is generally faster and more reliable than web scraping.