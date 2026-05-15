// src/services/dataService.js
// Diese Datei sorgt dafür, dass wir später ganz einfach auf eine echte Datenbank umsteigen können

const STORAGE_KEYS = {
  houses: "houses",
  appointments: "appointments",
  transactions: "transactions",
  vermieter: "vermieter",
};

// Hilfsfunktionen für localStorage
const getFromStorage = (key) => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : null;
};

const saveToStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Der eigentliche Service
export const dataService = {
  // Häuser
  getHouses: () => getFromStorage(STORAGE_KEYS.houses) || [],
  saveHouses: (houses) => saveToStorage(STORAGE_KEYS.houses, houses),

  // Termine
  getAppointments: () => getFromStorage(STORAGE_KEYS.appointments) || [],
  saveAppointments: (appointments) => saveToStorage(STORAGE_KEYS.appointments, appointments),

  // Buchungen / Finanzen
  getTransactions: () => getFromStorage(STORAGE_KEYS.transactions) || [],
  saveTransactions: (transactions) => saveToStorage(STORAGE_KEYS.transactions, transactions),

  // Vermieter Daten
  getVermieter: () => {
    const saved = getFromStorage(STORAGE_KEYS.vermieter);
    return saved || {
      name: "", 
      adresse: "", 
      plz: "", 
      ort: "", 
      telefon: "", 
      email: "",
      iban: "", 
      bic: "", 
      bankname: ""
    };
  },
  saveVermieter: (vermieter) => saveToStorage(STORAGE_KEYS.vermieter, vermieter),

  // Alles auf einmal laden
  loadAllData: () => ({
    houses: getFromStorage(STORAGE_KEYS.houses) || [],
    appointments: getFromStorage(STORAGE_KEYS.appointments) || [],
    transactions: getFromStorage(STORAGE_KEYS.transactions) || [],
    vermieter: getFromStorage(STORAGE_KEYS.vermieter) || {},
  }),

  // Backup-Funktion (nützlich später)
  exportAllData: () => ({
    houses: getFromStorage(STORAGE_KEYS.houses),
    appointments: getFromStorage(STORAGE_KEYS.appointments),
    transactions: getFromStorage(STORAGE_KEYS.transactions),
    vermieter: getFromStorage(STORAGE_KEYS.vermieter),
    exportedAt: new Date().toISOString(),
  })
};