FROM python:3.11

# Establecemos zona horaria.
ENV TZ=America/Argentina/Buenos_Aires
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Actualizamos el índice de paquetes e instalamos CMake y otras dependencias necesarias
RUN apt-get update && apt-get install -y \
    cmake \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiamos requirements.txt en el contenedor
COPY requirements.txt .

# Instalar el resto de las bibliotecas y paquetes usando pip
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el resto de los archivos de la aplicación
COPY . .