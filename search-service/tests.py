import requests
import unittest

BASE_URL = "http://localhost:4001"

class TestProductEndpoints(unittest.TestCase):
    def test_check_product_exist(self):
        """Test if a product exists nearby within 1km."""
        endpoint = f"{BASE_URL}/product/exists"
        payload = {
            "product": "model",
            "position": {
                "latitude": 40.7127,
                "longitude": 30.0061,
            }
        }
        response = requests.post(endpoint, json=payload)

        self.assertEqual(response.status_code, 200)

        data = response.json()

        self.assertIn("exists", data)
        if data["exists"]:
            self.assertIn("details", data)
            print("Product exists:", data["details"])
        else:
            print("Product does not exist nearby")

    def test_search_product_in_shop(self):
        """Test if a product is available in a specific shop nearby within 1km."""
        endpoint = f"{BASE_URL}/product/in-shop"
        payload = {
            "product": "model",
            "shop": "Tech Outlet",
            "position": {
                "latitude": 40.7127,
                "longitude": 30.0061,
            }
        }
        response = requests.post(endpoint, json=payload)
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertIn("exists", data)
        if data["exists"]:
            self.assertIn("details", data)
            self.assertEqual(data["shop"], "Tech Outlet")
            print("Product found in shop:", data["details"])
        else:
            print("Product not found in the specified shop")

    def test_find_lowest_price(self):
        """Test finding the lowest price for multiple products across nearby shops."""
        endpoint = f"{BASE_URL}/product/lowest-price"
        payload = {
            "products": ["model", "laptop", "tablet", "monitor"],
            "position": {
                "latitude": 40.7127,
                "longitude": 30.0061,
            }
        }
        response = requests.post(endpoint, json=payload)
        self.assertEqual(response.status_code, 200)

        data = response.json()
        print("data", data)  # Print the response for debugging

        # Verify the response is a list of shop combinations
        # self.assertIsInstance(data, list)
        # self.assertGreater(len(data), 0, "Expected at least one shop combination in the response")
        #
        # # Check each shop entry for required fields
        # for shop in data:
        #     self.assertIn("shop", shop)
        #     self.assertIn("total_price", shop)
        #     self.assertIn("products", shop)
        #     self.assertIsInstance(shop["shop"], str)
        #     self.assertIsInstance(shop["total_price"], (int, float))
        #     self.assertGreaterEqual(shop["total_price"], 0)
        #
        #     # Verify the products list within each shop
        #     self.assertIsInstance(shop["products"], list)
        #     self.assertGreater(len(shop["products"]), 0, "Expected at least one product in each shop")
        #
        #     for product in shop["products"]:
        #         self.assertIn("shop", product)
        #         self.assertIn("name", product)
        #         self.assertIn("description", product)
        #         self.assertIn("price", product)
        #         self.assertIn("distance", product)
        #         
        #         self.assertIsInstance(product["name"], str)
        #         self.assertIsInstance(product["description"], str)
        #         self.assertIsInstance(product["price"], (int, float))
        #         self.assertGreaterEqual(product["price"], 0)
        #         self.assertIsInstance(product["distance"], (int, float))
        #         self.assertGreaterEqual(product["distance"], 0)
        #         
        #         # Optional discount field check
        #         if "discount" in product:
        #             self.assertIsInstance(product["discount"], (float, type(None)))
        #
        # # If there is more than one shop, ensure prices are optimized
        # if len(data) > 1:
        #     total_prices = [shop["total_price"] for shop in data]
        #     self.assertEqual(total_prices, sorted(total_prices), "Expected shop totals to be sorted by lowest price")

        print("Lowest price shop combination:", data)


if __name__ == "__main__":
    unittest.main()

