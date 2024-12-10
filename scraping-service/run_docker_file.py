import os
import time
import threading

# Global event to signal when the threads should stop
stop_event = threading.Event()

# List of Docker commands to run periodically, along with their respective intervals (in seconds)
SCRAPING = [
	{'command': 'docker run --name my-container my-python-app', 'interval': 15} 
]

SCRAPING_SHOP = [
	{'command': 'docker run --name my-container my-python-app', 'interval': 15},  
	{'command': 'docker run --name my-other-container my-python-app_2', 'interval': 30}  
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
			os.system(f"docker rm {container_name} || true")
			os.system(command)
		except Exception as e:
			print(f"Error running command '{command}': {e}")
		
		if stop_event.wait(interval):
			break

# Starts initial Docker commands and then starts multiple threads for periodic Docker commands.
def start_docker_containers():
	
	print("\nSCRAPING_SHOP\n")
	run_once_commands(SCRAPING_SHOP) 
	
	threads = []
	print("\nSCRAPING\n")
	
	for docker_task in SCRAPING:
		command = docker_task['command']
		interval = docker_task['interval']
		
		t = threading.Thread(target=run_docker_command, args=(command, interval))
		t.start()
		threads.append(t)

	try:
		stop_event.wait()
	except KeyboardInterrupt:
		stop_event.set()
		for t in threads:
			t.join()
		print("Exit without problem\n")

if __name__ == "__main__":
	start_docker_containers()
