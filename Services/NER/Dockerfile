FROM python:3.11

# Establecemos zona horaria.
ENV TZ=America/Argentina/Buenos_Aires
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Instalamos 7zip (p7zip-full)
RUN apt-get update && apt-get install -y p7zip-full

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiamos requirements.txt en el contenedor
COPY requirements.txt .

# Instalar el resto de las bibliotecas y paquetes usando pip
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto de los archivos (incluyendo el model.safetensors)
COPY . .