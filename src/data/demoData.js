const today = new Date();
const y = today.getFullYear();
const m = String(today.getMonth() + 1).padStart(2, "0");
const maintenanceDate = `${y}-${m}-10`;
const viewingDate = `${y}-${m}-25`;

export const demoHouses = [
  {
    id: "demo-house-1",
    name: "Musterstraße 12",
    street: "Musterstraße",
    houseNumber: "12",
    city: "Berlin",
    monthlyLoan: 850,
    interestRate: 3.5,
    apartments: [
      {
        id: "demo-apt-1",
        name: "EG - 2 Zimmer",
        tenant: "Max Mustermann",
        tenant2: "",
        persons: 2,
        kaltmiete: 650,
        warmmiete: 850,
        deposit: 1950,
        notes: "Mieter seit 01.01.2024",
        tenant_phone: "+49 170 1234567",
        tenant_email: "max.mustermann@example.com",
      },
      {
        id: "demo-apt-2",
        name: "1. OG - 3 Zimmer",
        tenant: "Erika Musterfrau",
        tenant2: "",
        persons: 1,
        kaltmiete: 780,
        warmmiete: 980,
        deposit: 2340,
        notes: "Mieterin seit 15.03.2023",
        tenant_phone: "+49 171 9876543",
        tenant_email: "erika.musterfrau@example.com",
      },
    ],
    costs: {
      heating: { month: 120, quarter: 360, year: 1440 },
      water: { month: 45, quarter: 135, year: 540 },
      electricity: { month: 80, quarter: 240, year: 960 },
      insurance: { month: 35, quarter: 105, year: 420 },
      maintenance: { month: 50, quarter: 150, year: 600 },
      cleaning: { month: 30, quarter: 90, year: 360 },
    },
  },
  {
    id: "demo-house-2",
    name: "Hauptstraße 45",
    street: "Hauptstraße",
    houseNumber: "45",
    city: "München",
    monthlyLoan: 1200,
    interestRate: 4.0,
    apartments: [
      {
        id: "demo-apt-3",
        name: "DG - Penthouse",
        tenant: "Thomas Schmidt",
        tenant2: "Maria Schmidt",
        persons: 2,
        kaltmiete: 1200,
        warmmiete: 1500,
        deposit: 3600,
        notes: "Mieter seit 01.06.2022",
        tenant_phone: "+49 89 5551234",
        tenant_email: "thomas.schmidt@example.com",
      },
    ],
    costs: {
      heating: { month: 180, quarter: 540, year: 2160 },
      water: { month: 60, quarter: 180, year: 720 },
      electricity: { month: 120, quarter: 360, year: 1440 },
      insurance: { month: 45, quarter: 135, year: 540 },
      maintenance: { month: 80, quarter: 240, year: 960 },
      cleaning: { month: 50, quarter: 150, year: 600 },
    },
  },
];

export const demoVermieter = {
  name: "Vermieter GmbH",
  adresse: "Musterweg 1, 12345 Musterstadt",
  email: "info@vermieter-gmbh.de",
  telefon: "+49 123 456789",
  bank: "Musterbank",
  iban: "DE89 3704 0044 0532 0130 00",
  bic: "COBADEFFXXX",
  kontoinhaber: "Vermieter GmbH",
  kontonummer: "0532013000",
  blz: "37040044",
};

export const demoTransactions = [
  {
    id: "demo-trans-1",
    type: "income",
    amount: 850,
    description: "Miete EG",
    date: `${y}-${m}-01`,
  },
  {
    id: "demo-trans-2",
    type: "expense",
    amount: 250,
    description: "Heizung Reparatur",
    date: `${y}-${m}-05`,
  },
  {
    id: "demo-trans-3",
    type: "income",
    amount: 980,
    description: "Miete 1. OG",
    date: `${y}-${m}-01`,
  },
];

export const demoAppNews = [
  {
    id: "demo-news-1",
    title: "Willkommen bei ImmoForge",
    body: "Dies ist eine Demo-Nachricht. Als Admin kannst du echte News in den Einstellungen veröffentlichen.",
    created_at: new Date().toISOString(),
  },
];

export const demoAppointments = [
  {
    id: "demo-appt-1",
    house_id: "demo-house-1",
    appointment_type: "maintenance",
    date: maintenanceDate,
    time: "10:00",
    description: "Jährliche Wartung durch Heizungsfirma",
    maintenance_interval_months: 12,
  },
  {
    id: "demo-appt-2",
    house_id: "demo-house-2",
    appointment_type: "viewing",
    date: viewingDate,
    time: "14:00",
    description: "Besichtigung für neue Mieter",
    maintenance_interval_months: null,
  },
];
