# Imagen base
FROM node:21

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos necesarios
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos del proyecto
COPY . .

# Exponer el puerto de desarrollo
EXPOSE 5173

# Comando para iniciar el entorno de desarrollo
CMD ["npm", "run", "dev", "--", "--host"]