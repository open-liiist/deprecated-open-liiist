import time
import logging
import schedule
import datetime
import subprocess

# Configure logging
logging.basicConfig(
	level=logging.INFO,
	format="%(asctime)s - %(levelname)s - %(message)s",
	handlers=[logging.StreamHandler()]
)

scripts = [
	"/app/scraping_shop/conad/scraping_conad_shop.py",
	"/app/scraping_shop/gros_groups/cts/scraping_cts_shop.py",
	"/app/scraping_shop/gros_groups/dem/scraping_dem_shop.py",
	"/app/scraping_shop/gros_groups/effepiu/scraping_effepiu_shop.py",
	"/app/scraping_shop/gros_groups/idromarket/scraping_idromarket_shop.py",
	"/app/scraping_shop/gros_groups/il_castoro/scraping_il_castoro_shop.py",
	"/app/scraping_shop/gros_groups/ipercarni/scraping_ipercarni_shop.py",
	"/app/scraping_shop/gros_groups/ipertiscount/scraping_ipertiscount_shop.py",
	"/app/scraping_shop/gros_groups/ma/scraping_ma_shop.py",
	"/app/scraping_shop/gros_groups/pewex/scraping_pewex_shop.py",
	"/app/scraping_shop/gros_groups/pim/scraping_pim_shop.py",
	"/app/scraping_shop/gros_groups/sacoph/scraping_sacoph_shop.py",
	"/app/scraping_shop/gros_groups/top/scraping_top_shop.py",
	"/app/scraping_shop/oasi_tigre/scraping_tigre_shop.py"
]

# Path to a file to store the last execution date
LAST_RUN_FILE = "/app/last_run_date.txt"

def has_two_weeks_passed():
	"""Check if two weeks have passed since the last run."""
	try:
		with open(LAST_RUN_FILE, "r") as file:
			last_run_date = datetime.datetime.strptime(file.read().strip(), "%Y-%m-%d")

		days_since_last_run = (datetime.datetime.now() - last_run_date).days

		return days_since_last_run >= 14
	except FileNotFoundError:
		return True

def update_last_run_date():
	"""Update the last run date to today."""
	with open(LAST_RUN_FILE, "w") as file:
		file.write(datetime.datetime.now().strftime("%Y-%m-%d"))

def run_all_scripts():
	"""Run all scripts if two weeks have passed."""
	if has_two_weeks_passed():
		logging.info("Two weeks have passed. Running all scripts...")
		for script in scripts:

			logging.info(f"Starting {script}...")
			try:
				start_time = time.time()

				result = subprocess.run(["python3", script], capture_output=True, text=True)

				duration = time.time() - start_time
				logging.info(f"Finished {script} in {duration:.2f} seconds.")
				logging.info(f"Output of {script}:\n{result.stdout}")

				if result.stderr:
					logging.error(f"Error in {script}:\n{result.stderr}")
			except Exception as e:
				logging.error(f"Failed to run {script}: {e}")

		logging.info("All scripts have been processed.")
		update_last_run_date()
		
	else:
		logging.info("Less than two weeks since the last run. Skipping.")

# Schedule the task daily at 02:00 but only run it every two weeks
schedule.every().day.at("02:00").do(run_all_scripts)

# Run the scheduler loop
while True:
	schedule.run_pending()
	time.sleep(1)
