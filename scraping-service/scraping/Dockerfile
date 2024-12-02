FROM python:3.10

WORKDIR /app

RUN apt-get update && apt-get install -y \
    wget \
    curl \
    gnupg \
    unzip \
    cron

RUN curl -sSL https://dl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list

RUN apt-get update && apt-get install -y google-chrome-stable && \
    wget -O /tmp/chromedriver.zip https://chromedriver.storage.googleapis.com/$(curl -s https://chromedriver.storage.googleapis.com/LATEST_RELEASE)/chromedriver_linux64.zip && \
    unzip /tmp/chromedriver.zip -d /usr/local/bin/ && \
    rm /tmp/chromedriver.zip

COPY requirements.txt ./requirements.txt
RUN pip install -r requirements.txt

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
