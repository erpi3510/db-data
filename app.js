const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3003; // Wähle einen beliebigen Port
const fs = require('fs');
app.use(express.json());
const axios = require('axios');


// GET-Anfrage, um einen Datensatz basierend auf der ID abzurufen
app.get('/data/:id', (req, res) => {
    const id = parseInt(req.params.id); // Die ID aus der URL-Parameter extrahieren

    // Daten aus der JSON-Datei lesen
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }

        // JSON-Daten parsen
        const jsonData = JSON.parse(data);

        // Datensatz mit der angegebenen ID finden
        const foundData = jsonData.find(item => item.id === id);

        // Überprüfen, ob ein Datensatz gefunden wurde
        if (!foundData) {
            return res.status(404).send('Data not found');
        }

        // Antwort mit dem gefundenen Datensatz senden
        res.json(foundData);
    });
});

// GET: Alle URLs abrufen
app.get('/urls', (req, res) => {
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) throw err;
        res.json(JSON.parse(data));
    });
});

// GET-Anfrage, um einen Datensatz basierend auf der URL abzurufen
app.get('/data/url/:url', (req, res) => {
    const url = req.params.url; // Die URL aus der URL-Parameter extrahieren

    // Daten aus der JSON-Datei lesen
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }

        // JSON-Daten parsen
        const jsonData = JSON.parse(data);

        // Datensatz mit der angegebenen URL finden
        const foundData = jsonData.find(item => item.url === url);

        // Überprüfen, ob ein Datensatz gefunden wurde
        if (!foundData) {
            return res.status(404).send('Data not found');
        }

        // Antwort mit dem gefundenen Datensatz senden
        res.status(200).json(foundData);
    });
});


// POST: Neue URL hinzufügen
app.post('/urls', (req, res) => {
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) throw err;
        const urls = JSON.parse(data);
        const newUrl = { id: urls.length + 1, url: req.body.url };
        urls.push(newUrl);
        fs.writeFile('data.json', JSON.stringify(urls), (err) => {
            if (err) throw err;
            res.json(newUrl);
        });
    });
});

// PUT: URL aktualisieren
app.put('/urls/:id', (req, res) => {
    const id = parseInt(req.params.id);
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) throw err;
        let urls = JSON.parse(data);
        const index = urls.findIndex(url => url.id === id);
        if (index !== -1) {
            urls[index].url = req.body.url;
            fs.writeFile('data.json', JSON.stringify(urls), (err) => {
                if (err) throw err;
                res.json(urls[index]);
            });
        } else {
            res.status(404).json({ message: "URL not found" });
        }
    });
});

// DELETE: URL löschen
app.delete('/urls/:id', (req, res) => {
    const id = parseInt(req.params.id);
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) throw err;
        let urls = JSON.parse(data);
        const filteredUrls = urls.filter(url => url.id !== id);
        if (filteredUrls.length !== urls.length) {
            fs.writeFile('data.json', JSON.stringify(filteredUrls), (err) => {
                if (err) throw err;
                res.json({ message: "URL deleted successfully" });
            });
        } else {
            res.status(404).json({ message: "URL not found" });
        }
    });
});


// Route zum Öffnen der gespeicherten Daten
app.get('/open-data', (req, res) => {
    try {
        // Daten aus der Datei lesen
        const data = fs.readFileSync(filename, 'utf8');

        // Daten als JSON an den Client senden
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Fehler beim Öffnen der Datei:', error);
        res.status(500).send('Fehler beim Öffnen der Datei');
    }
});


// API-URL
const apiUrl = 'https://api.ooni.io/api/_/countries';

// Dateiname für die gespeicherten Daten
const filename = 'countrydata.json';

// Funktion zum Abrufen der Daten von der API
async function fetchDataAndSave() {
    try {
        // Daten von der API abrufen
        const response = await axios.get(apiUrl);
        const data = response.data;

        // Daten in eine Datei speichern
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));

        console.log('Daten wurden erfolgreich gespeichert:', filename);
    } catch (error) {
        console.error('Fehler beim Abrufen und Speichern der Daten:', error);
    }
}

// Route zum Öffnen der gespeicherten Daten
app.get('/open-data', (req, res) => {
    try {
        // Daten aus der Datei lesen
        const data = fs.readFileSync('countrydata.json', 'utf8');

        // Daten als JSON an den Client senden
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Fehler beim Öffnen der Datei:', error);
        res.status(500).send('Fehler beim Öffnen der Datei');
    }
});
// Starte den Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => { // 'finish' Event wird ausgelöst, wenn die Antwort vollständig gesendet wurde
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    });
    next();
});