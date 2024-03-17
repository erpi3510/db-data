const axios = require('axios');
const fs = require('fs');
const cron = require('node-cron');
// API-URL
const apiUrl = 'https://api.ooni.io/api/v1/aggregation?probe_cc=DE&'+getDateRange()+'&time_grain=day&axis_x=measurement_start_day&axis_y=domain&test_name=web_connectivity';

// Dateiname für die gespeicherten Daten
const filename = 'getdata7days.json';



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

        // Gruppierte Daten basierend auf der Domain erstellen
        const groupedData = data.result.reduce((acc, obj) => {
            // Entfernen Sie "www." aus der Domain, falls vorhanden
            const domain = obj.domain.startsWith('www.') ? obj.domain.slice(4) : obj.domain;
            const today = new Date().toISOString().slice(0, 10); // Heutiges Datum als String im Format JJJJ-MM-TT

            // Wenn die Domain bereits im Akkumulator vorhanden ist, aktualisieren Sie die Zähler
            if (acc[domain]) {
                acc[domain].anomaly_count += obj.anomaly_count;
                acc[domain].confirmed_count += obj.confirmed_count;
                acc[domain].failure_count += obj.failure_count;
                acc[domain].measurement_count += obj.measurement_count;
                acc[domain].ok_count += obj.ok_count;
            } else {
                // Ansonsten fügen Sie ein neues Objekt zum Akkumulator hinzu
                acc[domain] = {
                    ...obj,
                    domain,
                    measurement_start_day: today
                };
            }
            return acc;
        }, {});

        // Konvertiert das Objekt zurück in ein Array von Objekten
        const groupedDataArray = Object.values(groupedData);

        // Daten in die Datei schreiben
        fs.writeFileSync(filename, JSON.stringify(groupedDataArray, null, 2));

        console.log('Daten wurden erfolgreich gespeichert: ' + filename);
    } catch (error) {
        console.error('Fehler beim Abrufen und Speichern der Daten:', error);
    }
}




function getDateRange() {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 8); // 7 Tage vom aktuellen Datum subtrahieren

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
// cron.schedule('0 12 * * *', () => {
//     fetchDataAndSave();
// });

