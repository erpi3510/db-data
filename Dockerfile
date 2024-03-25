# Verwenden Sie das offizielle Node.js-Image als Basis
FROM node:latest

# Legen Sie das Arbeitsverzeichnis im Container fest
WORKDIR /usr/src/app

# Kopieren Sie die Paketdateien in das Arbeitsverzeichnis
COPY package*.json ./

# Installieren Sie die Abhängigkeiten
RUN npm install

# Kopieren Sie Ihr Startskript
COPY start.sh .
# Machen Sie es ausführbar (falls es noch nicht ausführbar ist)
RUN chmod +x ./start.sh

COPY . .

# Verwenden Sie das Startskript als CMD
CMD ["./start.sh"]

