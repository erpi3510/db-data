const axios = require('axios');
const fs = require('fs');
var cron = require('node-cron');
const { getDateRange } = require('./utils/dateRange');

// Dateiname für die gespeicherten Daten

const filename = 'db/data.json';

// Funktion zum Abrufen der Daten von der API und Speichern in der Datei
async function fetchDataAndSave() {
    var apiUrl = 'https://api.ooni.io/api/v1/aggregation?probe_cc=DE&'+getDateRange(1)+'&time_grain=day&axis_x=measurement_start_day&axis_y=domain&test_name=web_connectivity';
    try {
        // Daten von der API abrufen
        const response = await axios.get(apiUrl);
        const data = response.data;

        // Überprüfen, ob data ein Objekt ist und das result-Array vorhanden ist
        if (typeof data !== 'object' || !data.hasOwnProperty('result') || !Array.isArray(data.result)) {
            console.error('Die empfangenen Daten haben nicht das erwartete Format.');
            return;
        }

        // Eindeutige Ids zu jedem Objekt im result-Array hinzufügen und "www." aus Domainnamen entfernen
        data.result.forEach((obj, index) => {
            // Überprüfen, ob die Domain mit "www." beginnt und entfernen Sie sie
            if (obj.domain.startsWith('www.')) {
                obj.domain = obj.domain.slice(4);
            }
            // Hinzufügen einer eindeutigen Id
            obj.id = index + 1;
        });

        // Daten in die Datei schreiben
        fs.writeFileSync(filename, JSON.stringify(data.result, null, 2));

        console.log('Daten wurden erfolgreich gespeichert: ' + filename);
    } catch (error) {
        console.error('Fehler beim Abrufen und Speichern der Daten:', error);
    }
}

// Funktion zum einmaligen Datenabruf und Speichern bei Programmstart
//fetchDataAndSave();

// Zeitgesteuerten Datenabruf einrichten (um 12 Uhr mittags jeden Tag)
cron.schedule('*/2 * * * *', () => {
    fetchDataAndSave();
});

