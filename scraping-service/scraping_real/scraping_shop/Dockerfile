FROM python:3.10

WORKDIR /app

COPY requirements.txt ./requirements.txt

RUN pip install -r requirements.txt

RUN apt-get update && apt-get install -y cron

COPY oasi_tigre/ ./oasi_tigre/
COPY conad/ ./conad/
COPY gros_groups/ ./gros_groups/
COPY ../crontab.txt /etc/cron.d/scraping-cron

RUN chmod 0644 /etc/cron.d/scraping-cron && crontab /etc/cron.d/scraping-cron

ENV PYTHONPATH=/app

CMD ["cron", "-f"]
