const axios = require('axios');
const fs = require('fs');
const cron = require('node-cron');

// API-URL
const apiUrl = 'https://api.ooni.io/api/v1/aggregation?probe_cc=DE&'+getDateRange()+'&time_grain=day&axis_x=measurement_start_day&axis_y=domain&test_name=web_connectivity';

// Dateiname für die gespeicherten Daten
const filename = 'data.json';

// Funktion zum Abrufen der Daten von der API und Speichern in der Datei
async function fetchDataAndSave() {
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



function getDateRange() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Ein Tag zum aktuellen Datum hinzufügen

    const yearSince = today.getFullYear();
    let monthSince = today.getMonth() + 1;
    let daySince = today.getDate();

    // Führende Nullen hinzufügen, wenn der Monat oder Tag einstellig ist
    monthSince = monthSince < 10 ? '0' + monthSince : monthSince;
    daySince = daySince < 10 ? '0' + daySince : daySince;

    const yearUntil = tomorrow.getFullYear();
    let monthUntil = tomorrow.getMonth() + 1;
    let dayUntil = tomorrow.getDate();

    // Führende Nullen hinzufügen, wenn der Monat oder Tag einstellig ist
    monthUntil = monthUntil < 10 ? '0' + monthUntil : monthUntil;
    dayUntil = dayUntil < 10 ? '0' + dayUntil : dayUntil;

    const since = `${yearSince}-${monthSince}-${daySince}`;
    const until = `${yearUntil}-${monthUntil}-${dayUntil}`;
    
    console.log(`since=${since}&until=${until}`); 
    return `since=${since}&until=${until}`;
}



// Funktion zum einmaligen Datenabruf und Speichern bei Programmstart
fetchDataAndSave();

// Zeitgesteuerten Datenabruf einrichten (um 12 Uhr mittags jeden Tag)
cron.schedule('*/10 * * * *', () => {
    fetchDataAndSave();
});

