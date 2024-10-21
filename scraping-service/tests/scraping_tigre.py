import time
from selenium import webdriver
from selenium.webdriver.common.by import By

# Declaration of dictionaries and lists 

shop_info = {
	"name" : "tigre",
	"street": "via",
	"working_hours": "2"
}

categories_url = [
	"https://oasitigre.it/it/spesa/reparti/Frutta-e-Verdura/Frutta-Fresca.html",
	"https://oasitigre.it/it/spesa/reparti/Frutta-e-Verdura/Frutta-Pronta-da-mangiare.html"
]

product_info = {
	"name" : "start",
	"img_url" : "start",
	"description" : "start",
	"new_price" : "start",
	"old_price" : "start"
}

# Declaration of functions

# def extract_product_info(driver, micro_cate):
# 	n_cards = len(driver.find_elements(By.XPATH, f'/html/body/main/div[1]/div[2]/div[2]/div[{micro_cate}]/div/div[2]/div/div/div[1]/div'))
# 	# print(n_cards)
# 	for k in range(1, n_cards):
# 		product_info.update(name = driver.find_element(By.XPATH, f'/html/body/main/div[1]/div[2]/div[2]/div[2]/div/div[2]/div/div/div[1]/div[1]/div/div[3]/div[2]/h4').text)
# 		product_info.update(img_url = driver.find_element(By.XPATH, f'').text)
# 		product_info.update(description = driver.find_element(By.XPATH, f'/html/body/main/div[1]/div[2]/div[2]/div[2]/div/div[2]/div/div/div[1]/div[1]/div/div[3]/div[3]/p').text)
# 		product_info.update(new_price = driver.find_element(By.XPATH, f'/html/body/main/div[1]/div[2]/div[2]/div[2]/div/div[2]/div/div/div[1]/div[1]/div/div[4]/div[1]/div[2]/p').text)
# 		product_info.update(old_price = driver.find_element(By.XPATH, f'/html/body/main/div[1]/div[2]/div[2]/div[2]/div/div[2]/div/div/div[1]/div[1]/div/div[4]/div[1]/div[1]/p').text)
# 		print(product_info)

driver = webdriver.Firefox()
driver.get("https://oasitigre.it/it/negozi-volantini.html") 

time.sleep(4)
driver.find_element(By.ID, "CybotCookiebotDialogBodyButtonDecline").click()
understan why it can't find the button
driver.find_element(By.XPATH, '/html/body/main/div[2]/div[1]/div[3]/div[1]/div[1]/div[3]').click()
time.sleep(3)
driver.find_element(By.CLASS_NAME, 'button button--blue conferma').click()

shop_info.update(name = driver.find_element(By.XPATH, f'/html/body/main/div[2]/div[1]/div[3]/div[8]/div[1]/div[2]/p[1]/b').text)
shop_info.update(street = driver.find_element(By.XPATH, f'/html/body/main/div[2]/div[1]/div[3]/div[8]/div[1]/div[2]/p[2]').text)
shop_info.update(working_hours = driver.find_element(By.XPATH, f'/html/body/main/div[2]/div[1]/div[3]/div[8]/div[1]/div[2]/div/p/b').text)

for x in categories_url:
	driver.get(x)
	time.sleep(5)
	micro_cate = len(driver.find_elements(By.XPATH, '/html/body/main/div[1]/div[2]/div[2]/div'))
	for k in range(2, micro_cate):
		n_cards = len(driver.find_elements(By.XPATH, f'/html/body/main/div[1]/div[2]/div[2]/div[{micro_cate}]/div/div[2]/div/div/div[1]/div'))
		for n in range(1, n_cards):
			product_info.update(name = driver.find_element(By.XPATH, f'/html/body/main/div[1]/div[2]/div[2]/div[2]/div/div[2]/div/div/div[1]/div[{n}]/div/div[3]/div[2]/h4').text)
			print(product_info["name"])

driver.close()