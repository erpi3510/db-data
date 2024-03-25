const axios = require('axios');
const fs = require('fs');
const { URL } = require('url');
const cron = require('node-cron');

// Funktion zum Lesen der Daten aus der blocked.json-Datei
function readBlockedData() {
  try {
    // Daten aus der JSON-Datei lesen
    const data = fs.readFileSync('primaryBlocked.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Fehler beim Lesen der primaryBlocked.json-Datei:', error.message);
    return [];
  }
}

// Funktion zum Schreiben der Daten in die blocked.json-Datei
function writeBlockedData(blockedData) {
  try {
    // URLs in der blockedData bereinigen, um "https://", "http://" und den Schrägstrich am Ende zu entfernen
    const cleanedData = blockedData.map(item => {
      let cleanedURL = item.url.replace(/^https?:\/\//i, ''); // "https://" oder "http://" entfernen
      cleanedURL = cleanedURL.replace(/\/$/, ''); // Schrägstrich am Ende entfernen
      cleanedURL = cleanedURL.replace(/^www\./i, ''); // "www." entfernen
      return { ...item, url: cleanedURL };
    });

    // Daten in die JSON-Datei schreiben
    fs.writeFileSync('blocked.json', JSON.stringify(cleanedData, null, 2), 'utf8');
    console.log('blocked.json erfolgreich aktualisiert.');
  } catch (error) {
    console.error('Fehler beim Schreiben in die blocked.json-Datei:', error.message);
  }
}



// Funktion zum Abrufen der URL und Überprüfen, ob sie sich geändert hat
async function checkURLChangeAndUpdate() {
  const blockedData = readBlockedData();
  
  for (const item of blockedData) {
    try {
      // Hinzufügen von "http://" zur URL, falls es nicht bereits vorhanden ist
      const url = item.url.startsWith('http') ? item.url : `http://${item.url}`;

      // HTTP-Anfrage an die angegebene URL senden
      const response = await axios.get(url);
      
      // Überprüfen des HTTP-Statuscodes der Antwort
      if (response.status === 200) {
        const newURL = (new URL(response.request.res.responseUrl)).hostname;;
        if (item.url !== newURL) {
          console.log(`Die URL hat sich geändert. Neue URL: ${newURL}`);
          item.url = newURL; // Aktualisiere die URL im Datensatz
        } else {
          console.log('Die URL hat sich nicht geändert.');
        }
      } else {
        console.log('Fehler beim Abrufen der URL.');
      }
    } catch (error) {
      // Fehlerbehandlung für den Fall, dass die HTTP-Anfrage fehlschlägt
      console.error(`Fehler beim Abrufen der URL ${item.url}:`, error.message);
    }
  }

  // Aktualisierte Daten in die blocked.json-Datei schreiben
  writeBlockedData(blockedData);
}


// Funktion aufrufen, um die URL zu überprüfen und zu aktualisieren
checkURLChangeAndUpdate();

cron.schedule('*/30 * * * *', () => {
  checkURLChangeAndUpdate();
});


