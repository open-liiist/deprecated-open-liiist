import os
import time
import threading

# Global event to signal when the threads should stop
stop_event = threading.Event()

# List of Docker commands to run periodically, along with their respective intervals (in seconds)
SCRAPING = [
	{'command': 'docker run --name scraping_cts scraping_cts', 'interval': 86400}  # 1 day = 86400 seconds
]

SCRAPING_SHOP = [
	{'command': 'docker run --name scraping_cts_shop scraping_cts_shop', 'interval': 1209600},  # 2 weeks = 1209600 seconds
	# {'command': 'docker run --name my-other-container my-python-app_2', 'interval': 30}  
]

# Run a list of Docker commands once.
def run_once_commands(commands):
	for docker_task in commands:
		command = docker_task['command']
		container_name = command.split('--name ')[1].split(' ')[0] 
	
		try:
			os.system(f"docker stop {container_name} || true")
			os.system(f"docker rm {container_name} || true")
			os.system(command)
		except Exception as e:
			print(f"Error running command '{command}': {e}")


# Run a Docker command at a fixed interval.
def run_docker_command(command, interval):
	while not stop_event.is_set():
		try:
			container_name = command.split('--name ')[1].split(' ')[0] 
			os.system(f"docker stop {container_name} || true")
			os.system(f"docker rm {container_name} || true")
			print(f"Running command: {command}")
			os.system(command)
		except Exception as e:
			print(f"Error running command '{command}': {e}")
		
		if stop_event.wait(interval):
			break

# Starts initial Docker commands and then starts multiple threads for periodic Docker commands.
def start_docker_containers():
	print("\nRunning SCRAPING_SHOP (Once at Startup)\n")
	run_once_commands(SCRAPING_SHOP) 
	
	threads = []

	print("\nRunning SCRAPING_SHOP (Every 2 weeks)\n")
	for docker_task in SCRAPING_SHOP:
		command = docker_task['command']
		interval = docker_task['interval']
		t = threading.Thread(target=run_docker_command, args=(command, interval))
		t.start()
		threads.append(t)

	print("\nRunning SCRAPING (Every day)\n")
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
		print("\nExit without problem\n")
		exit(0)

if __name__ == "__main__":
	start_docker_containers()
