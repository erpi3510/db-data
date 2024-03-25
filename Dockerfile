# Verwenden Sie das offizielle Node.js-Image als Basis
FROM node:latest

# Legen Sie das Arbeitsverzeichnis im Container fest
WORKDIR /usr/src/app

# Kopieren Sie die Paketdateien in das Arbeitsverzeichnis
COPY package*.json ./

# Installieren Sie die Abhängigkeiten
RUN npm install

# Kopieren Sie den restlichen Code in das Arbeitsverzeichnis
COPY . .

# Setzen Sie den Standardbefehl, um Ihre Anwendung auszuführen
CMD ["npm", "run", "start"]

