import time
import sys
import undetected_chromedriver as uc
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from utility_tigre import shop_info, categories_dict 

# Manages the search in the page

def wait_for_element(driver, xpath):
	try:
		return WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, xpath)))
	except Exception as e:
		print("Element not found within 10 seconds:", e)
		driver.close()
		sys.exit()

def wait_for_elements(driver, xpath):
	try:
		elements = driver.find_elements(By.XPATH, xpath)
		if not elements:
			print("No elements found in:" + xpath)
			return []
		else:
			return(elements)
	except Exception as e:
		print("An error occurred:", e)
		driver.close()
		sys.exit()

# Find all the information that we need for a specific micro_category

def find_and_send_info(driver, n_cards, micro_cate):
	active_1 = 1
	for card in range(1, n_cards + 1):
		name = wait_for_element(driver,f'/html/body/main/div[1]/div[2]/div[2]/div[{micro_cate}]/div/div[2]/div/div/div[1]/div[{card}]/div/div[3]/div[2]/h4').text
		image_element = wait_for_element(driver, f'/html/body/main/div[1]/div[2]/div[2]/div[{micro_cate}]/div/div[2]/div/div/div[1]/div[{card}]/div/div[3]/div[1]/a/img')
		img_url = image_element.get_attribute("src")
		description = wait_for_element(driver, f'/html/body/main/div[1]/div[2]/div[2]/div[{micro_cate}]/div/div[2]/div/div/div[1]/div[{card}]/div/div[3]/div[3]/p').text
		new_price = wait_for_element(driver, f'/html/body/main/div[1]/div[2]/div[2]/div[{micro_cate}]/div/div[2]/div/div/div[1]/div[{card}]/div/div[4]/div[1]/div[2]/p').text
		old_price = wait_for_element(driver, f'/html/body/main/div[1]/div[2]/div[2]/div[{micro_cate}]/div/div[2]/div/div/div[1]/div[{card}]/div/div[4]/div[1]/div[1]/p').text
		print(name, description, new_price, old_price)
		if (active_1 == 1):
			try:
				wait_for_element(driver, f"/html/body/main/div[1]/div[2]/div[2]/div[{micro_cate}]/div/div[2]/div/div/div[3]").click()	
			except:		
				active_1 = 0

# selezione oasi tigre in location passata come parametro, seleziona il primo negozio trovato
def change_shop_location(driver, location):
	driver.get("https://oasitigre.it/it/spesa.html") 
	driver.find_element(By.CLASS_NAME, 'ritira-in-negozio-main-page').click()
	wait = WebDriverWait(driver, 20)
	wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input.form-control.pdv.pac-target-input")))
	input_box = driver.find_element(By.CSS_SELECTOR, "input.form-control.pdv.pac-target-input")
	input_box.click()
	input_box.send_keys(location)
	time.sleep(2)
	input_box.send_keys(Keys.ENTER)
	time.sleep(3)
	available_shops = driver.find_elements(By.XPATH, "//div[@class='shop-card-container']/div[@class='card-selezione-negozio']")
	if len(available_shops) == 0:
		print('No shops found')
		return
	available_shops[0].click()
	time.sleep(2)
	driver.find_element(By.CLASS_NAME, "scegliDopo").click()
	print('Search performed')	
	time.sleep(10)

# cancella cookies in caso sia gia stata selezionato un negozio precedentemente
def change_already_selected_shop(driver, location):
	# remove cookies orderActivatedOasiOT
	driver.delete_all_cookies()
	change_shop_location(driver, location)

if __name__ == "__main__":
	driver = uc.Chrome(
		use_subprocess=False,
	)
	change_shop_location(driver, "Roma")
	change_already_selected_shop(driver, "San benedetto del tronto")
	# Just add a for to make all shops
	# get_the_shop_info(driver, 8)
	for category, items in categories_dict.items():
		for item in items:
			driver.get(f"https://oasitigre.it/it/spesa/reparti/{category}/{item}.html")
			time.sleep(5)
			n_micro_cate = len(wait_for_elements(driver, '/html/body/main/div[1]/div[2]/div[2]/div'))
			active = 1
			for micro_cate in range(2, n_micro_cate + 1):
				if (active == 1):
					try:
						element = wait_for_element(driver, f"/html/body/main/div[1]/div[2]/div[2]/div[{micro_cate}]")
						driver.execute_script('arguments[0].scrollIntoView(true)', element)
					except:
						active = 0
				n_cards = len(wait_for_elements(driver, f'/html/body/main/div[1]/div[2]/div[2]/div[{micro_cate}]/div/div[2]/div/div/div[1]/div'))
				find_and_send_info(driver, n_cards, micro_cate)
				print("\n")

	driver.close()