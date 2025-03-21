import time
import logging
import schedule
import subprocess

# Configure logging
logging.basicConfig(
	level=logging.INFO,
	format="%(asctime)s - %(levelname)s - %(message)s",
	handlers=[logging.StreamHandler()]
)

def run_all_scripts():
	scripts = [
		"/app/scraping/gros_groups/cts/scraping_cts.py",
		"/app/scraping/gros_groups/dem/scraping_dem.py",
		"/app/scraping/gros_groups/effepiu/scraping_effepiu.py",
		"/app/scraping/gros_groups/idromarket/scraping_idromarket.py",
		"/app/scraping/gros_groups/il_castoro/scraping_il_castoro.py",
		"/app/scraping/gros_groups/ipercarni/scraping_ipercarni.py",
		"/app/scraping/gros_groups/ipertiscount/scraping_ipertiscount.py",
		"/app/scraping/gros_groups/ma/scraping_ma.py",
		"/app/scraping/gros_groups/pewex/scraping_pewex.py",
		"/app/scraping/gros_groups/pim/scraping_pim.py",
		"/app/scraping/gros_groups/sacoph/scraping_sacoph.py",
		"/app/scraping/gros_groups/top/scraping_top.py",
	]

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

# Schedule the task to run daily at midnight
schedule.every().day.at("03:00").do(run_all_scripts)

# Run the scheduler loop
while True:
	schedule.run_pending()
	time.sleep(1)
