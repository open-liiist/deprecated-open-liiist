FROM python:3.10

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY libft ./libft

COPY scraping_cts_shop.py ./scraping_cts_shop.py

ENV PYTHONPATH=/app

RUN chmod +x scraping_cts_shop.py

# Comando per eseguire lo script
CMD ["python3", "scraping_cts_shop.py"]
