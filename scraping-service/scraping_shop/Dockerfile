FROM python:3.10

WORKDIR /app

# Install Python dependencies
COPY requirements.txt ./
RUN pip install -r requirements.txt

# Install cron for scheduling
RUN apt-get update && apt-get install -y cron

# Copy application files
COPY libft/ ./libft/
COPY oasi_tigre/ ./oasi_tigre/
COPY conad/ ./conad/
COPY crontab.txt /etc/cron.d/scraping-cron

# Set permissions for the cron file
RUN chmod 0644 /etc/cron.d/scraping-cron && crontab /etc/cron.d/scraping-cron

# Start cron and the service
CMD ["cron", "-f"]
