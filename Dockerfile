# Verwenden Sie das offizielle Node.js-Image als Basis
FROM node:latest

# Legen Sie das Arbeitsverzeichnis im Container fest
WORKDIR /usr/src/app

# Kopieren Sie die Abhängigkeiten und den Code in das Arbeitsverzeichnis
COPY package*.json ./
RUN npm install
COPY . .

# Setzen Sie den Standardbefehl, um Ihre Anwendung auszuführen
CMD ["node", "app.js"]
