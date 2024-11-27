import requests

url = 'http://localhost:8080/ricevi_code'

try:
	response = requests.post(url, data={'code': 1, 'shop': "conad"})
	response = requests.post(url, data={'code': 2, 'shop': "conad"})
	response = requests.post(url, data={'code': 3, 'shop': "conad"})
	response = requests.post(url, data={'code': 6, 'shop': "conad"})
except:
	print("Server down o non up")
	exit()

if response.status_code == 200:
    print("code inviato con successo!")
else:
    print("Si è verificato un errore:", response.text)