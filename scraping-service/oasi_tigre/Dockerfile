FROM python:3.10

WORKDIR /app

COPY ../requirements.txt ./

# Install dependencies
RUN pip install -r requirements.txt

COPY ../libft.py ./
COPY ../send_data.py ./

COPY scraping_tigre.py ./

# Command to run the script
CMD ["python", "scraping_tigre.py"]

# # Install cron and set up the cronjob
# RUN apt-get update && apt-get install -y cron
# RUN crontab cronjob
#
# # Start cron and the main Python app
# CMD cron && tail -f /var/log/cron.log
