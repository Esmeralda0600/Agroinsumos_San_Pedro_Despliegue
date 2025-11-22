# Imagen base oficial de Node.js
FROM node:18-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar archivos de configuración
COPY package*.json ./

# Instalar dependencias
RUN npm install 
#RUN npm install --save-dev nodemon

# Copiar el resto del proyecto
COPY . .

# Exponer el puerto
EXPOSE ${PORT}

# Comando por defecto
# CMD ["node", "server.js"]
# CMD ["npm", "start"]
CMD ["npm", "dev"]
