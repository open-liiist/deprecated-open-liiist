import os
import time
import threading

# Global event to signal when the threads should stop
stop_event = threading.Event()

# List of Docker commands to run periodically, along with their respective intervals (in seconds)
# 1 day = 86400 seconds
# 2 hours = 7200 seconds
SCRAPING = [
	{'command': 'docker run --name scraping_conad scraping_conad', 'interval': 7200},
	{'command': 'docker run --name scraping_tigre scraping_tigre', 'interval': 7200},
	{'command': 'docker run --name scraping_cts scraping_cts', 'interval': 86400},  
	{'command': 'docker run --name scraping_dem scraping_dem', 'interval': 86400},
	{'command': 'docker run --name scraping_effepiu scraping_effepiu', 'interval': 86400},
	{'command': 'docker run --name scraping_idromarket scraping_idromarket', 'interval': 86400},
	{'command': 'docker run --name scraping_il_castoro scraping_il_castoro', 'interval': 86400},
	{'command': 'docker run --name scraping_ipercarni scraping_ipercarni', 'interval': 86400},
	{'command': 'docker run --name scraping_ipertriscount scraping_ipertriscount', 'interval': 86400},
	{'command': 'docker run --name scraping_ma scraping_ma', 'interval': 86400},
	{'command': 'docker run --name scraping_pewex scraping_pewex', 'interval': 86400},
	{'command': 'docker run --name scraping_pim scraping_pim', 'interval': 86400},
	{'command': 'docker run --name scraping_sacoph scraping_sacoph', 'interval': 86400},
	{'command': 'docker run --name scraping_top scraping_top', 'interval': 86400},
]

# 2 weeks = 1209600 seconds
SCRAPING_SHOP = [
	{'command': 'docker run --name scraping_conad_shop scraping_conad_shop', 'interval': 1209600},
	{'command': 'docker run --name scraping_tigre_shop scraping_tigre_shop', 'interval': 1209600},
	{'command': 'docker run --name scraping_cts_shop scraping_cts_shop', 'interval': 1209600},
	{'command': 'docker run --name scraping_dem_shop scraping_dem_shop', 'interval': 1209600},
	{'command': 'docker run --name scraping_effepiu_shop scraping_effepiu_shop', 'interval': 1209600},
	{'command': 'docker run --name scraping_idromarket_shop scraping_idromarket_shop', 'interval': 1209600},
	{'command': 'docker run --name scraping_il_castoro_shop scraping_il_castoro_shop', 'interval': 1209600},
	{'command': 'docker run --name scraping_ipercarni_shop scraping_ipercarni_shop', 'interval': 1209600},
	{'command': 'docker run --name scraping_ipertriscount_shop scraping_ipertriscount_shop', 'interval': 1209600},
	{'command': 'docker run --name scraping_ma_shop scraping_ma_shop', 'interval': 1209600},
	{'command': 'docker run --name scraping_pewex_shop scraping_pewex_shop', 'interval': 1209600},
	{'command': 'docker run --name scraping_pim_shop scraping_pim_shop', 'interval': 1209600},
	{'command': 'docker run --name scraping_sacoph_shop scraping_sacoph_shop', 'interval': 1209600},
	{'command': 'docker run --name scraping_top_shop scraping_top_shop', 'interval': 1209600},
]

# Run a Docker command periodically at fixed intervals.
# It ensures any existing container with the same name is stopped and removed
# before running the specified command. The process repeats based on the interval.
def run_docker_command(command, interval):
	
	while not stop_event.is_set():
		try:
			container_name = command.split('--name ')[1].split(' ')[0] 
			os.system(f"docker ps -a --filter name={container_name} | grep {container_name} && docker stop {container_name} || true")
			os.system(f"docker ps -a --filter name={container_name} | grep {container_name} && docker rm {container_name} || true")
			print(f"Running command: {command}")
			os.system(command)
		except Exception as e:
			print(f"Error running command '{command}': {e}")
		
		if stop_event.wait(interval):
			break

# Starts a Docker container by running the specified command.
# - Stops and removes any existing container with the same name before starting.
def run_docker_command_one_time(command):

    try:
        container_name = command.split('--name ')[1].split(' ')[0]
        # Stop and remove any existing container
        os.system(f"docker ps -a --filter name={container_name} | grep {container_name} && docker stop {container_name} || true")
        os.system(f"docker ps -a --filter name={container_name} | grep {container_name} && docker rm {container_name} || true")
        print(f"Starting container: {command}")
        os.system(command)
    except Exception as e:
        print(f"Error starting container '{command}': {e}")

# Waits until the specified Docker container stops running.
def wait_for_container_to_stop(container_name):

    try:
        print(f"Waiting for container {container_name} to stop...")
        while True:
            container_status = os.popen(f"docker inspect -f '{{{{.State.Running}}}}' {container_name}").read().strip()
            if container_status == "false" or container_status == "":
                break
            time.sleep(25)
        print(f"Container {container_name} has stopped.")
    except Exception as e:
        print(f"Error waiting for container '{container_name}' to stop: {e}")

# Starts all Docker commands for SCRAPING_SHOP and SCRAPING.
# Runs all SCRAPING_SHOP tasks sequentially, waiting for each to complete.
# Starts SCRAPING and SCRAPING_SHOP tasks in parallel threads, running them periodically.
def start_docker_containers():
	
	print("\nRunning SCRAPING_SHOP tasks...\n")
	for docker_task in SCRAPING_SHOP:
		run_docker_command_one_time(docker_task['command'])

	for docker_task in SCRAPING_SHOP:
		container_name = docker_task['command'].split('--name ')[1].split(' ')[0]
		wait_for_container_to_stop(container_name)

	print("\nAll SCRAPING_SHOP tasks completed. Starting periodic SCRAPING tasks...\n")

	threads = []
	print("\nRunning SCRAPING_SHOP\n")
	for docker_task in SCRAPING_SHOP:
		command = docker_task['command']
		interval = docker_task['interval']
		t = threading.Thread(target=run_docker_command, args=(command, interval))
		t.start()
		threads.append(t)

	print("\nRunning SCRAPING\n")
	for docker_task in SCRAPING:
		command = docker_task['command']
		interval = docker_task['interval']
		t = threading.Thread(target=run_docker_command, args=(command, interval))
		t.start()
		threads.append(t)
			
	try:
		stop_event.wait()
	except KeyboardInterrupt:
		print("\nStopping all threads...")
		stop_event.set()
		for t in threads:
			t.join()
		print("\nAll tasks stopped. Exiting.")
		exit(0)

if __name__ == "__main__":
	start_docker_containers()

