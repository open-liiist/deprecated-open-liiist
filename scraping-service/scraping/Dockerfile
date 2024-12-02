FROM python:3.10

WORKDIR /app

# Install dependencies and tools
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    gnupg \
    unzip \
    cron

# Add Google's GPG key and the correct Chrome repository
RUN curl -sSL https://dl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list

# Install Google Chrome and Chromedriver
RUN apt-get update && apt-get install -y google-chrome-stable && \
    wget -O /tmp/chromedriver.zip https://chromedriver.storage.googleapis.com/$(curl -s https://chromedriver.storage.googleapis.com/LATEST_RELEASE)/chromedriver_linux64.zip && \
    unzip /tmp/chromedriver.zip -d /usr/local/bin/ && \
    rm /tmp/chromedriver.zip

# Install Python dependencies
COPY requirements.txt ./
RUN pip install -r requirements.txt

# Copy application files
COPY libft/ ./libft/
COPY oasi_tigre/ ./oasi_tigre/
COPY conad/ ./conad/
COPY crontab.txt /etc/cron.d/scraping-cron

# Set permissions for the cron file
RUN chmod 0644 /etc/cron.d/scraping-cron && crontab /etc/cron.d/scraping-cron

# Add /app to PYTHONPATH
ENV PYTHONPATH=/app

# Start cron and keep the container running
CMD ["cron", "-f"]
