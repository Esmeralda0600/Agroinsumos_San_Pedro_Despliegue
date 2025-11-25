# Imagen base oficial de Node.js
FROM node:18-alpine

ARG CACHEBUST=4

WORKDIR /usr/src/app

# Copiar package.json correcto desde /api
COPY ./package.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el contenido real del proyecto /api
COPY . .

EXPOSE 3000

# Comando por defecto
# CMD ["node", "server.js"]
CMD ["npm", "start"]

