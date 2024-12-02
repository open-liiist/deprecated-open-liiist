FROM python:3.10

WORKDIR /app

# Install dependencies and tools
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    gnupg \
    unzip

# Add Google's GPG key and the correct Chrome repository
RUN curl -sSL https://dl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list

# Install Google Chrome and Chromedriver
RUN apt-get update && apt-get install -y google-chrome-stable && \
    wget -O /tmp/chromedriver.zip https://chromedriver.storage.googleapis.com/$(curl -s https://chromedriver.storage.googleapis.com/LATEST_RELEASE)/chromedriver_linux64.zip && \
    unzip /tmp/chromedriver.zip -d /usr/local/bin/ && \
    rm /tmp/chromedriver.zip

COPY .env .env

RUN export $(cat .env | xargs)

# Install Python dependencies
COPY requirements.txt ./
RUN pip install -r requirements.txt

# Copy application files
COPY libft/ ./libft/
COPY conad/ ./conad/

# Add /app to PYTHONPATH
ENV PYTHONPATH=/app

CMD ["python", "oasi_tigre/scraping_conad.py"]

