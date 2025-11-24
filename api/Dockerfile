# Imagen base oficial de Node.js
FROM node:18-alpine

# DOCKER NO CACHE
ARG CACHEBUST=4

# Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar package.json (y opcionalmente package-lock.json si existiera)
COPY package.json ./

# Instalar dependencias **RECIÉN COPIADAS**
RUN npm install

# Copiar todo el proyecto
COPY . .

# Exponer puerto definido en Render
EXPOSE 3000

# Comando para ejecutar el servidor
CMD ["npm", "start"]
