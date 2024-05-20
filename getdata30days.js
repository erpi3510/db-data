const axios = require('axios');
const fs = require('fs');
var cron = require('node-cron');
const { getDateRange } = require('./utils/dateRange');

// Dateiname für die gespeicherten Daten
const filename = 'db/getdata30days.json';



async function fetchDataAndSave() {
    var apiUrl = 'https://api.ooni.io/api/v1/aggregation?probe_cc=DE&'+getDateRange(29)+'&time_grain=day&axis_x=measurement_start_day&axis_y=domain&test_name=web_connectivity';

    try {
        // Daten von der API abrufen
        const response = await axios.get(apiUrl);
        const data = response.data;

        // Überprüfen, ob data ein Objekt ist und das result-Array vorhanden ist
        if (typeof data !== 'object' || !data.hasOwnProperty('result') || !Array.isArray(data.result)) {
            console.error('Die empfangenen Daten haben nicht das erwartete Format.');
            return;
        }

        // Bereiten Sie das Datenarray vor, um das heutige Datum für jedes Element hinzuzufügen
        
        const updatedDataArray = data.result.map(obj => {
            // Entfernen Sie "www." aus der Domain, falls vorhanden
            const domain = obj.domain.startsWith('www.') ? obj.domain.slice(4) : obj.domain;
            return {
                ...obj,
                domain, // Aktualisierte Domain ohne "www."
                
            };
        });

        // Daten in die Datei schreiben
        fs.writeFileSync(filename, JSON.stringify(updatedDataArray, null, 2));

        console.log('Daten wurden erfolgreich gespeichert: ' + filename);
    } catch (error) {
        console.error('Fehler beim Abrufen und Speichern der Daten:', error);
    }
}

// Funktion zum einmaligen Datenabruf und Speichern bei Programmstart
fetchDataAndSave();

// Zeitgesteuerten Datenabruf einrichten (um 12 Uhr mittags jeden Tag)
cron.schedule('0 12 * * *', () => {
    fetchDataAndSave();
});

