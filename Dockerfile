FROM node:20-slim
WORKDIR /app

# Copy the lists of dependencies first
COPY package*.json ./
RUN npm install

# Copy all your folders (css, js, img) and files (index.html)
COPY . .

EXPOSE 3000

# Run the app from the js folder
CMD ["node", "js/app.js"]