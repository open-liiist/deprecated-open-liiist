import time
import logging
import subprocess

# Configure logging
logging.basicConfig(
	level=logging.INFO,
	format="%(asctime)s - %(levelname)s - %(message)s",
	handlers=[logging.StreamHandler()]
)

scripts = [
	"/app/gros_groups/cts/scraping_cts.py",
	"/app/gros_groups/dem/scraping_dem.py",
	"/app/gros_groups/effepiu/scraping_effepiu.py",
	"/app/gros_groups/idromarket/scraping_idromarket.py",
	"/app/gros_groups/il_castoro/scraping_il_castoro.py",
	"/app/gros_groups/ipercarni/scraping_ipercarni.py",
	"/app/gros_groups/ipertiscount/scraping_ipertiscount.py",
	"/app/gros_groups/ma/scraping_ma.py",
	"/app/gros_groups/pewex/scraping_pewex.py",
	"/app/gros_groups/pim/scraping_pim.py",
	"/app/gros_groups/sacoph/scraping_sacoph.py",
	"/app/gros_groups/top/scraping_top.py",
]

def run_all_scripts():
	"""Run all scripts"""
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

run_all_scripts()
