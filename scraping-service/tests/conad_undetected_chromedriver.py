import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
import time

if __name__ == "__main__":

	# instantiate a Chrome browser
	driver = uc.Chrome(
		use_subprocess=False,
	)

	driver.get("https://spesaonline.conad.it/home")
	time.sleep(1)
	driver.find_element(By.ID, "onetrust-reject-all-handler").click()
	# time.sleep(2)
	form = driver.find_element(By.CLASS_NAME, "google-input")
	form.find_element(By.ID, "googleInputEntrypageLine1").send_keys("Milano")
	time.sleep(2)
	form.find_element(By.CLASS_NAME, "submitButton").click()
	time.sleep(2)
	driver.find_element(By.XPATH, '//*[@id="ordina-e-ritira"]/div/div/button').click()
	time.sleep(2)
	driver.find_element(By.XPATH, '//*[@id="ordina-ritira-scelta-pdv"]/div[2]/div/div[1]/div/ul/li[1]/div').click()
	time.sleep(2)
	driver.find_element(By.XPATH, '//*[@id="modal-onboarding-wrapper"]/div[2]/div[5]/button').click()
	time.sleep(10)
	driver.get("https://spesaonline.conad.it/c/--0102")
	time.sleep(2)
	n_cards = len(driver.find_elements(By.XPATH, '//*[@id="#top"]/div/div[2]/div[2]/div[4]/div'))
	products = []
	for card in range(n_cards + 1):
		try:
			title = driver.find_element(By.XPATH, f'//*[@id="#top"]/div/div[2]/div[2]/div[4]/div[{card + 1}]/div/div[1]/div[1]/div[2]/a/div[2]/h3').text
			product_price = driver.find_element(By.XPATH, f'//*[@id="#top"]/div/div[2]/div[2]/div[4]/div[{card + 1}]/div/div[1]/div[1]/div[2]/div[1]/div[3]').text
			quantity = driver.find_element(By.XPATH, f'//*[@id="#top"]/div/div[2]/div[2]/div[4]/div[{card + 1}]/div/div[1]/div[1]/div[2]/div[1]/div[1]/b').text
			product = {
				"title": title,
                "price": product_price,
				"quantity": quantity
			}
			
			print(f"Product title: {title} {product_price} {quantity}")
		except Exception as e:
			print(f"Error could be due to a promo card or a different layout.")
		
	time.sleep(100)
	driver.quit()