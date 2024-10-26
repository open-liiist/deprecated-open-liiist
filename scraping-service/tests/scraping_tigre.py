import time
import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from utility_tigre import shop_info, categories_dict 

# Waits for an element or elements to be present on the page

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

def find_and_send_info(driver, n_cards, k):
	active_1 = 1
	for n in range(1, n_cards + 1):
		name = wait_for_element(driver,f'/html/body/main/div[1]/div[2]/div[2]/div[{k}]/div/div[2]/div/div/div[1]/div[{n}]/div/div[3]/div[2]/h4').text
		image_element = wait_for_element(driver, f'/html/body/main/div[1]/div[2]/div[2]/div[{k}]/div/div[2]/div/div/div[1]/div[{n}]/div/div[3]/div[1]/a/img')
		img_url = image_element.get_attribute("src")
		description = wait_for_element(driver, f'/html/body/main/div[1]/div[2]/div[2]/div[{k}]/div/div[2]/div/div/div[1]/div[{n}]/div/div[3]/div[3]/p').text
		new_price = wait_for_element(driver, f'/html/body/main/div[1]/div[2]/div[2]/div[{k}]/div/div[2]/div/div/div[1]/div[{n}]/div/div[4]/div[1]/div[2]/p').text
		old_price = wait_for_element(driver, f'/html/body/main/div[1]/div[2]/div[2]/div[{k}]/div/div[2]/div/div/div[1]/div[{n}]/div/div[4]/div[1]/div[1]/p').text
		print(name, description, new_price, old_price)
		if (active_1 == 1):
			try:
				wait_for_element(driver, f"/html/body/main/div[1]/div[2]/div[2]/div[{k}]/div/div[2]/div/div/div[3]").click()	
			except:		
				active_1 = 0

# Get to a shop and save the information that we need

def get_the_shop_info(driver):
	driver.get("https://oasitigre.it/it/negozi-volantini.html") 
	time.sleep(4)
	try:
		cookie_button = wait_for_element(driver, "//button[@id='CybotCookiebotDialogBodyButtonDecline']")
		cookie_button.click()
	except:
		pass
	# understan why it can't find the button
	# wait_for_element(driver, '/html/body/main/div[2]/div[1]/div[3]/div[1]/div[1]/div[3]').click()
	# time.sleep(3)
	# driver.find_element(By.CLASS_NAME, 'button button--blue conferma').click()
	shop_info.update(name = wait_for_element(driver, f'/html/body/main/div[2]/div[1]/div[3]/div[8]/div[1]/div[2]/p[1]/b').text)
	shop_info.update(street = wait_for_element(driver, f'/html/body/main/div[2]/div[1]/div[3]/div[8]/div[1]/div[2]/p[2]').text)
	shop_info.update(working_hours = wait_for_element(driver, f'/html/body/main/div[2]/div[1]/div[3]/div[8]/div[1]/div[2]/div/p/b').text)


if __name__ == "__main__":
	driver = webdriver.Firefox()
	# get_the_shop_info(driver)
	for category, items in categories_dict.items():
		for item in items:
			driver.get(f"https://oasitigre.it/it/spesa/reparti/{category}/{item}.html")
			driver.maximize_window()
			time.sleep(5)
			micro_cate = len(wait_for_elements(driver, '/html/body/main/div[1]/div[2]/div[2]/div'))
			active = 1
			for k in range(2, micro_cate + 1):
				if (active == 1):
					try:
						element = wait_for_element(driver, f"/html/body/main/div[1]/div[2]/div[2]/div[{k}]")
						driver.execute_script('arguments[0].scrollIntoView(true)', element)
					except:
						active = 0
				n_cards = len(wait_for_elements(driver, f'/html/body/main/div[1]/div[2]/div[2]/div[{k}]/div/div[2]/div/div/div[1]/div'))
				find_and_send_info(driver, n_cards, k)
				print("\n")

	driver.close()