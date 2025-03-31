# Define a verção do Node.js
FROM node:20

# Define o diretório de trabalho do container
WORKDIR /app

# Copia o arquivo de dependências do projeto para o container
COPY package.json .

# Instala as dependências do projeto
RUN npm install

# Copia o código do projeto para o container
COPY . .

# Exponha a porta do aplicativo
EXPOSE 3000

# Inicie o aplicativo
CMD ["npm", "start"]