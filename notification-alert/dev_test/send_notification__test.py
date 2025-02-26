import requests

url = 'http://localhost:5000/send_notification'

try:
	response = requests.post(url, data={'code': 1, 'shop': "conad"})
	response = requests.post(url, data={'code': 2, 'shop': "conad"})
	response = requests.post(url, data={'code': 3, 'shop': "conad"})
	response = requests.post(url, data={'code': 6, 'shop': "conad"})
except:
	print("Server status: down or not running")
	exit()

if response.status_code == 200:
	print("Code sent successfully!")
else:
	print("An error occurred:", response.text)