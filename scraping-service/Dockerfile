FROM python:3.10

WORKDIR /app

RUN apt-get update && \
    apt-get install -y docker.io && \
    rm -rf /var/lib/apt/lists/*

COPY run_docker_file.py ./run_docker_file.py

RUN chmod +x run_docker_file.py

CMD ["python3", "run_docker_file.py"]
