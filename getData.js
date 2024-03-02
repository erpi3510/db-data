const axios = require('axios');
const fs = require('fs');
const cron = require('node-cron');

// API-URL
const apiUrl = 'https://api.ooni.io/api/_/countries';

// Dateiname für die gespeicherten Daten
const filename = 'countrydata.json';

// Funktion zum Abrufen der Daten von der API und Speichern in der Datei
async function fetchDataAndSave() {
    try {
        // Daten von der API abrufen
        const response = await axios.get(apiUrl);
        const data = response.data;

        // Daten in die Datei schreiben
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));

        console.log('Daten wurden erfolgreich gespeichert: ' + filename);
    } catch (error) {
        console.error('Fehler beim Abrufen und Speichern der Daten:', error);
    }
}

// Funktion zum einmaligen Datenabruf und Speichern bei Programmstart
fetchDataAndSave();

// Zeitgesteuerten Datenabruf einrichten (um 12 Uhr mittags jeden Tag)
// cron.schedule('0 12 * * *', () => {
//     fetchDataAndSave();
// });

