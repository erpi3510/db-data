function getDateRange(days) {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days); // Tage vom aktuellen Datum subtrahieren

    const yearSince = startDate.getFullYear();
    let monthSince = startDate.getMonth() + 1; // Monate sind 0-indiziert
    let daySince = startDate.getDate();

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

module.exports = { getDateRange };
