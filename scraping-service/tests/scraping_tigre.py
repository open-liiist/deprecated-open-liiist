import requests
import json
import time
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Firefox()

driver.get("https://oasitigre.it/it/negozi-volantini.html") 

shop = BeautifulSoup(driver.page_source, "html.parser")

shop_info = {
	"name" : "tigre",
	"street": "via",
	"working_hours": "2"
}

time.sleep(4)
driver.find_element(By.ID, "CybotCookiebotDialogBodyButtonDecline").click()

shop_info.update(name = (shop.find('p', class_ = 'nameShop').text))
shop_info.update(street = (shop.find('p', class_ = 'streetShop').text))
shop_info.update(working_hours = (shop.find('p', class_ = 'closingHoursShop').text))

print(shop_info)

# categories_url = [
# 	"https://oasitigre.it/it/spesa/reparti/Frutta-e-Verdura/Frutta-Fresca.html",
# 	"https://oasitigre.it/it/spesa/reparti/Frutta-e-Verdura/Frutta-Pronta-da-mangiare.html"
# ]

driver.get("https://oasitigre.it/it/spesa/reparti/Frutta-e-Verdura/Frutta-Fresca.html")
time.sleep(3)
# info = BeautifulSoup(driver.page_source, "html.parser")
n_cards = len(driver.find_elements(By.XPATH, f'/html/body/main/div[1]/div[2]/div[2]/div[2]/div/div[2]/div/div/div[1]/div'))
print(n_cards)
for i in range(n_cards):
	pass
# cards = driver.find_element(By.XPATH, f'/html/body/main/div[1]/div[2]/div[2]/div[2]/div/div[2]/div/div/div[1]/div')

# n_cards = info.find_all('div', class_='swiper-slide product-card-no-p swiper-slide-active')
# tittle = n_cards[0].find('a', class_='product-link product-link-title').text
# img_url = n_cards[0].find('a', class_='product-link product-link-img')
# sub_title = n_cards[0].find('div', class_='productSubTitle').text
# new_price = n_cards[0].find('div', class_='oldPrice').text
# old_price = n_cards[0].find('div', class_='newPrice').text
# print(tittle)
# print(img_url)
# print(sub_title)
# print(new_price)
# print(old_price)

driver.close()