FROM python:3.10

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY libft ./libft
COPY produtti_send.py ./produtti_send.py

COPY all_oasi_tigre.json ./all_oasi_tigre.json
COPY /oasi_tigre_shop.json ./oasi_tigre_shop.json

COPY all_gros.json ./all_gros.json
COPY all_gros_shop.json ./all_gros_shop.json


ENV PYTHONPATH=/app

RUN chmod +x produtti_send.py

CMD ["python3", "produtti_send.py"]

