import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains

# Declaration of dictionaries and lists 

shop_info = {
	"name" : "tigre",
	"street": "via",
	"working_hours": "2"
}

categories_url = [
	"https://oasitigre.it/it/spesa/reparti/Frutta-e-Verdura/Frutta-Fresca.html",
	"https://oasitigre.it/it/spesa/reparti/Frutta-e-Verdura/Frutta-Pronta-da-mangiare.html",
	"https://oasitigre.it/it/spesa/reparti/Frutta-e-Verdura/Aglio-Peperoncino-Odori.html",
	"https://oasitigre.it/it/spesa/reparti/Frutta-e-Verdura/Funghi-Olive-Capperi.html",
	"https://oasitigre.it/it/spesa/reparti/Frutta-e-Verdura/Ortaggi.html",
	"https://oasitigre.it/it/spesa/reparti/Frutta-e-Verdura/Verdura-Fresca.html",
	"https://oasitigre.it/it/spesa/reparti/Frutta-e-Verdura/Verdura-Lavata-o-Tagliata.html",
	"https://oasitigre.it/it/spesa/reparti/Frutta-e-Verdura/Frutta-Secca-Disidratata.html",
	"https://oasitigre.it/it/spesa/reparti/Frutta-e-Verdura/Legumi-e-Cereali-secchi.html",
	"https://oasitigre.it/it/spesa/reparti/Frutta-e-Verdura/Barrette-Snack-Polpa-frutta.html",
	"https://oasitigre.it/it/spesa/reparti/Frutta-e-Verdura/Condimenti-Spezie-Farine.html",
	"https://oasitigre.it/it/spesa/reparti/Frutta-e-Verdura/Piatti-Pronti.html"
]

product_info = {
	"name" : "start",
	"img_url" : "start",
	"description" : "start",
	"new_price" : "start",
	"old_price" : "start"
}

# Declaration of functions

def extract_product_info(driver, n_cards, k):
	active_1 = 1
	for n in range(1, n_cards):
		product_info.update(name = driver.find_element(By.XPATH, f'/html/body/main/div[1]/div[2]/div[2]/div[{k}]/div/div[2]/div/div/div[1]/div[{n}]/div/div[3]/div[2]/h4').text)
		image_element = driver.find_element(By.XPATH, f"/html/body/main/div[1]/div[2]/div[2]/div[{k}]/div/div[2]/div/div/div[1]/div[{n}]/div/div[3]/div[1]/a/img")
		product_info.update(img_url = image_element.get_attribute("src"))
		product_info.update(description = driver.find_element(By.XPATH, f'/html/body/main/div[1]/div[2]/div[2]/div[{k}]/div/div[2]/div/div/div[1]/div[{n}]/div/div[3]/div[3]/p').text)
		product_info.update(new_price = driver.find_element(By.XPATH, f'/html/body/main/div[1]/div[2]/div[2]/div[{k}]/div/div[2]/div/div/div[1]/div[{n}]/div/div[4]/div[1]/div[2]/p').text)
		product_info.update(old_price = driver.find_element(By.XPATH, f'/html/body/main/div[1]/div[2]/div[2]/div[{k}]/div/div[2]/div/div/div[1]/div[{n}]/div/div[4]/div[1]/div[1]/p').text)
		print(product_info)
		if (active_1 == 1):
			try:
				driver.find_element(By.XPATH, f"/html/body/main/div[1]/div[2]/div[2]/div[{k}]/div/div[2]/div/div/div[3]").click()
			except:		
				active_1 = 0

driver = webdriver.Firefox()
# driver.get("https://oasitigre.it/it/negozi-volantini.html") 
# time.sleep(4)
# driver.find_element(By.ID, "CybotCookiebotDialogBodyButtonDecline").click()
# understan why it can't find the button
# driver.find_element(By.XPATH, '/html/body/main/div[2]/div[1]/div[3]/div[1]/div[1]/div[3]').click()
# time.sleep(3)
# driver.find_element(By.CLASS_NAME, 'button button--blue conferma').click()
# shop_info.update(name = driver.find_element(By.XPATH, f'/html/body/main/div[2]/div[1]/div[3]/div[8]/div[1]/div[2]/p[1]/b').text)
# shop_info.update(street = driver.find_element(By.XPATH, f'/html/body/main/div[2]/div[1]/div[3]/div[8]/div[1]/div[2]/p[2]').text)
# shop_info.update(working_hours = driver.find_element(By.XPATH, f'/html/body/main/div[2]/div[1]/div[3]/div[8]/div[1]/div[2]/div/p/b').text)
for x in categories_url:
	driver.get(x)
	driver.maximize_window()
	time.sleep(5)
	micro_cate = len(driver.find_elements(By.XPATH, '/html/body/main/div[1]/div[2]/div[2]/div'))
	active = 1
	for k in range(2, micro_cate + 1):
		if (active == 1):
			try:
				element = driver.find_element(By.XPATH, f"/html/body/main/div[1]/div[2]/div[2]/div[{k}]")
				driver.execute_script('arguments[0].scrollIntoView(true)', element)
			except:
				active = 0
		n_cards = len(driver.find_elements(By.XPATH, f'/html/body/main/div[1]/div[2]/div[2]/div[{k}]/div/div[2]/div/div/div[1]/div'))
		extract_product_info(driver, n_cards, k)
		print("\n")

driver.close()
