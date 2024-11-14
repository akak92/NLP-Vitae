FROM python:3.11

# Establecemos zona horaria.
ENV TZ=America/Argentina/Buenos_Aires
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Instala las dependencias necesarias para Tesseract
RUN apt-get update && \
    apt-get install -y \
    libleptonica-dev \
    tesseract-ocr \
    tesseract-ocr-spa && \
    rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y poppler-utils

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiamos requirements.txt en el contenedor
COPY requirements.txt .

# Instalar el resto de las bibliotecas y paquetes usando pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . .