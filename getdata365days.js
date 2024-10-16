const axios = require('axios');
const fs = require('fs');
const cron = require('node-cron');
// API-URL
const apiUrl = 'https://api.ooni.io/api/v1/aggregation?probe_cc=DE&'+getDateRange()+'&time_grain=day&axis_x=measurement_start_day&axis_y=domain&test_name=web_connectivity';

// Dateiname für die gespeicherten Daten
const filename = 'getdata365days.json';



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

        // Datenarray vorbereiten
        const preparedData = data.result.map(obj => {
            // Entfernen von "www." aus der Domain, falls vorhanden
            const domain = obj.domain.startsWith('www.') ? obj.domain.slice(4) : obj.domain;
            return {
                ...obj,
                domain, // Aktualisierte Domain ohne "www."
                measurement_start_day: new Date(obj.measurement_start_day) // Datum als Date-Objekt speichern
            };
        });

        // Daten nach Domain und Monat gruppieren und Zählungen akkumulieren
        const groupedData = preparedData.reduce((acc, obj) => {
            // Key für die Gruppierung erstellen (Domain und Monat)
            const key = `${obj.domain}_${obj.measurement_start_day.getFullYear()}-${obj.measurement_start_day.getMonth() + 1}`;

            // Überprüfen, ob der Key bereits im Akkumulator existiert, wenn nicht, ein neues Objekt erstellen
            if (!acc[key]) {
                acc[key] = {
                    domain: obj.domain,
                    month: obj.measurement_start_day.getMonth() + 1, // Monat
                    year: obj.measurement_start_day.getFullYear(), // Jahr
                    anomaly_count: 0,
                    confirmed_count: 0,
                    failure_count: 0,
                    measurement_count: 0
                };
            }

            // Zählungen akkumulieren
            acc[key].anomaly_count += obj.anomaly_count;
            acc[key].confirmed_count += obj.confirmed_count;
            acc[key].failure_count += obj.failure_count;
            acc[key].measurement_count += obj.measurement_count;

            return acc;
        }, {});

        // Konvertieren des gruppierten Objekts in ein Array
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
    sevenDaysAgo.setDate(today.getDate() - 366); // 7 Tage vom aktuellen Datum subtrahieren

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

