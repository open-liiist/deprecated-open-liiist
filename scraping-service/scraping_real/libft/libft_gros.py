import re
import os
import requests
from dotenv import load_dotenv

load_dotenv()

# Fetches the HTML content from a given URL.
# Returns: The HTML content of the page, or None if an error occurs.

def get_html_from_url(url, headers):

	try:
		response = requests.get(url, headers = headers)
		return response
	except:
		if response.status_code != 200:
			print('Request failed:', response.status_code)
			exit()

# Checks if the text contains the phrase "Questo indirizzo".
# Returns: True if the text contains "Questo indirizzo", False otherwise.

def has_questo_indirizzo(text):
	return "Questo indirizzo" in text

# Checks if the text contains the word "Superficie".
# Returns: True if the text contains "Superficie", False otherwise.

def has_superficie(text):
	return "Superficie" in text

# Checks if a string contains a phone number in a valid format.
# Returns: True if a phone number is found, False otherwise.

def has_phone_number(string):
	phone_number_regex = r"(\d{2}\s\d{6,7})|(\d{2}\.\d{2}\s\d{2}\s\d{2}\s\d{2})|(\d{2}\.\s\d{2}\s\d{2}\s\d{2}\s\d{2})|(\d{3}-\d{3}-\d{4})|(\(\d{3}\)\s\d{3}-\d{4})|(\d{3}\s\d{3}\s\d{4})"
	return re.search(phone_number_regex, string) is not None

# Fetches geographical coordinates and additional location details for a given address using the Google Maps Geocoding API.
# Returns: A tuple containing latitude, longitude, city, and postal code (if available).
# Raises:
#   ValueError: If the API key is missing.
#   RuntimeError: If the API request fails or the response status is not 'OK'.

def geocode(address):
	api_key = os.environ.get('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY')
	if not api_key:
		raise ValueError("API key is missing. Ensure 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY' is set in environment variables.")

	url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={api_key}"

	try:
		response = requests.get(url)
		response.raise_for_status()  
		data = response.json()  
	except requests.exceptions.RequestException as e:
		raise RuntimeError(f"An error occurred while making the API request: {e}")

	if data.get('status') == 'OK':
		location = data['results'][0]['geometry']['location']
		lat = location['lat']
		lng = location['lng']

		address_components = data['results'][0]['address_components']
		city = None
		postal_code = None
		for component in address_components:
			if 'locality' in component['types']:
				city = component['long_name']
			elif 'postal_code' in component['types']:
				postal_code = component['long_name']

		return lat, lng, city, postal_code
	else:
		error_message = data.get('error_message', 'No error message provided.')
		raise RuntimeError(f"Geocoding failed with status: {data['status']}. Error message: {error_message}")