FROM node:20-slim
WORKDIR /app
# We use * to copy package.json AND package-lock.json if they exist
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "js/app.js"]