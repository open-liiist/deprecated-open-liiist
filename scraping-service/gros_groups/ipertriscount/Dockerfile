FROM python:3.10

WORKDIR /app

# Install dependencies
COPY ../requirements.txt .
RUN pip install -r requirements.txt

# Copy source files
COPY . .

CMD ["python", "scraper_ipertriscount.py"]

# # Install cron and set up the cronjob
# RUN apt-get update && apt-get install -y cron
# RUN crontab cronjob
#
# # Start cron and the main Python app
# CMD cron && tail -f /var/log/cron.log

