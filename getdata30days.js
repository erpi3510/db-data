const axios = require('axios');
const fs = require('fs');
var cron = require('node-cron');

// Dateiname für die gespeicherten Daten
const filename = 'db/getdata30days.json';



async function fetchDataAndSave() {
    var apiUrl = 'https://api.ooni.io/api/v1/aggregation?probe_cc=DE&'+getDateRange()+'&time_grain=day&axis_x=measurement_start_day&axis_y=domain&test_name=web_connectivity';

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

function getDateRange() {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 29); // 7 Tage vom aktuellen Datum subtrahieren

    const yearSince = sevenDaysAgo.getFullYear();
    let monthSince = sevenDaysAgo.getMonth() + 1; // Monate sind 0-indiziert
    let daySince = sevenDaysAgo.getDate();

    // Führende Nullen hinzufügen, wenn der Monat oder Tag einstellig ist
    monthSince = monthSince < 10 ? '0' + monthSince : monthSince;
    daySince = daySince < 10 ? '0' + daySince : daySince;

    const yearUntil = today.getFullYear();
    let monthUntil = today.getMonth() + 1; // Monate sind 0-indiziert
    let dayUntil = today.getDate();

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
cron.schedule('0 12 * * *', () => {
    fetchDataAndSave();
});

