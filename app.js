// app.js

// Costanti per le chiavi di localStorage
const CLIENTS_STORAGE_KEY = 'planVisite_clients';
const VISITS_STORAGE_KEY = 'planVisite_visits';

// Variabili globali
let clients = [];
let visits = [];
let nextClientId = 0;
let isUpdating = false;

// Gestione delle notifiche
document.getElementById('notifyBtn').addEventListener('click', () => {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            new Notification('Notifica abilitata!', {
                body: 'Ora riceverai notifiche importanti dalla nostra app.',
                icon: './icons/icon-192x192.png'
            });
        } else {
            alert('Le notifiche non sono state abilitate.');
        }
    });
});

// Gestione della Modalità Scura
function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

window.addEventListener('DOMContentLoaded', () => {
    // Carica la modalità scura se precedentemente abilitata
    const isDarkMode = JSON.parse(localStorage.getItem('darkMode'));
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').checked = true;
    }

    // Carica i dati dei clienti e delle visite
    loadClients();
    loadVisits();
});

// Funzioni di utilità per il formato numerico europeo
function formatEuro(value) {
    if (!isFinite(value)) return "";
    return value.toLocaleString("it-IT", { style: 'currency', currency: 'EUR' });
}

function parseEuropeanFloat(value) {
    if (!value) return 0;
    value = value.replace(/€/g, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
}

// Caricamento dei clienti da localStorage o da CSV
function loadClients() {
    const storedClients = JSON.parse(localStorage.getItem(CLIENTS_STORAGE_KEY));
    if (storedClients && Array.isArray(storedClients)) {
        clients = storedClients;
        nextClientId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 0;
        populateClientsList(clients);
    }
}

// Salvataggio dei clienti su localStorage
function saveClients() {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
}

// Popolamento della lista dei clienti nel select
function populateClientsList(clientsList) {
    const clientSelect = document.getElementById("orderPotentialClientsList");
    clientSelect.innerHTML = "";
    clientsList.forEach(client => {
        const option = document.createElement("option");
        option.value = client.id;
        option.textContent = `${client.nominativo} (${client.città}, ${client.Regione})`;
        clientSelect.appendChild(option);
    });
}

// Filtraggio dei clienti in base alla ricerca
function filterClients() {
    const searchQuery = document.getElementById("orderSearchClientPotential").value.toLowerCase();
    const filtered = clients.filter(c =>
        c.nominativo.toLowerCase().includes(searchQuery) ||
        c.città.toLowerCase().includes(searchQuery) ||
        c.Regione.toLowerCase().includes(searchQuery)
    );
    populateClientsList(filtered);
}

// Selezione dei clienti per le visite
function selectClients() {
    const clientSelect = document.getElementById("orderPotentialClientsList");
    const selectedIds = Array.from(clientSelect.selectedOptions).map(opt => parseInt(opt.value, 10));
    const selectedClients = clients.filter(c => selectedIds.includes(c.id));

    const clientDetailsTableBody = document.getElementById("clientDetailsTableBody");
    clientDetailsTableBody.innerHTML = "";

    selectedClients.forEach(client => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${client.nominativo}</td>
            <td>${client.indirizzo}</td>
            <td>${client.città}</td>
            <td>${client.Regione}</td>
            <td>${client.telefono}</td>
        `;
        clientDetailsTableBody.appendChild(row);
    });
}

// Importazione dei clienti da un file CSV
document.getElementById('potentialClientsCSV').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            parseClientsCSV(e.target.result);
        };
        reader.readAsText(file);
    }
});

// Parsing del CSV dei clienti
function parseClientsCSV(data) {
    const lines = data.trim().split("\n");
    // Assume che la prima riga sia l'intestazione
    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(";");
        if (row.length >= 5) {
            const client = {
                id: nextClientId++,
                nominativo: row[0].trim(),
                indirizzo: row[1].trim(),
                città: row[2].trim(),
                Regione: row[3].trim(),
                telefono: row[4].trim()
            };
            clients.push(client);
        }
    }
    saveClients();
    filterClients();
}

// Aggiunta di un nuovo cliente tramite modulo
function openAddClientModal() {
    document.getElementById("addClientModal").style.display = "block";
}

function closeAddClientModal() {
    document.getElementById("addClientModal").style.display = "none";
    document.getElementById("addClientForm").reset();
}

document.getElementById("addClientForm").addEventListener("submit", function(event){
    event.preventDefault();
    const nominativo = document.getElementById("newClientName").value.trim();
    const indirizzo = document.getElementById("newClientAddress").value.trim();
    const città = document.getElementById("newClientCity").value.trim();
    const Regione = document.getElementById("newClientRegion").value.trim();
    const telefono = document.getElementById("newClientPhone").value.trim();

    if (!nominativo || !indirizzo || !città) {
        alert("Compila almeno Nome, Indirizzo e Città.");
        return;
    }

    const newClient = {
        id: nextClientId++,
        nominativo,
        indirizzo,
        città,
        Regione,
        telefono
    };

    clients.push(newClient);
    saveClients();
    filterClients();
    closeAddClientModal();
    alert("Nuovo cliente aggiunto con successo!");
});

// Caricamento delle visite da localStorage
function loadVisits() {
    const storedVisits = JSON.parse(localStorage.getItem(VISITS_STORAGE_KEY));
    if (storedVisits && Array.isArray(storedVisits)) {
        visits = storedVisits;
        populateVisitsTable(visits);
    }
}

// Salvataggio delle visite su localStorage
function saveVisits() {
    localStorage.setItem(VISITS_STORAGE_KEY, JSON.stringify(visits));
}

// Popolazione della tabella delle visite salvate
function populateVisitsTable(visitsList) {
    const tableBody = document.getElementById("savedVisitsTableBody");
    tableBody.innerHTML = "";

    visitsList.forEach((visit, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${formatDateEuropean(visit.date)}</td>
            <td>${visit.client.nominativo}</td>
            <td>${formatEuro(visit.total)}</td>
            <td>${visit.note || '-'}</td>
            <td><button onclick="editVisit(${index})" class="no-print">Modifica</button></td>
            <td><button onclick="deleteVisit(${index})" class="no-print">Elimina</button></td>
        `;
        tableBody.appendChild(row);
    });
}

// Formattazione della data in formato europeo
function formatDateEuropean(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date)) return '-';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Salvataggio dei dati della visita/ordine
function saveVisitData() {
    const clientSelect = document.getElementById("orderPotentialClientsList");
    const selectedIds = Array.from(clientSelect.selectedOptions).map(opt => parseInt(opt.value, 10));
    const selectedClients = clients.filter(c => selectedIds.includes(c.id));

    if (selectedClients.length === 0) {
        alert("Seleziona almeno un cliente.");
        return;
    }

    const visitDate = document.getElementById("orderDate").value || new Date().toISOString().split('T')[0];
    const note = document.getElementById("orderNote").value.trim();
    const total = parseEuropeanFloat(document.getElementById('totalArticlesValue').textContent);
    const validitaPreventivo = document.getElementById("validitaPreventivo").value || "";
    const numeroPreventivo = document.getElementById("numeroPreventivo").value || "";

    const visit = {
        date: visitDate,
        client: selectedClients[0],
        total: total,
        note: note,
        numeroPreventivo: numeroPreventivo,
        validitaPreventivo: validitaPreventivo,
        // Aggiungi altri campi se necessario
    };

    // Se stai modificando una visita esistente
    if (typeof currentEditIndex === 'number') {
        visits[currentEditIndex] = visit;
        currentEditIndex = null;
        alert("Visita aggiornata con successo!");
    } else {
        visits.push(visit);
        alert("Nuova visita salvata con successo!");
    }

    saveVisits();
    populateVisitsTable(visits);
    resetVisitForm();
}

// Variabile per tracciare l'indice della visita corrente in fase di modifica
let currentEditIndex = null;

// Funzione per resettare il form dopo il salvataggio
function resetVisitForm() {
    document.getElementById("orderForm").reset();
    document.getElementById("clientDetailsTableBody").innerHTML = "";
    document.getElementById("totalArticlesValue").textContent = formatEuro(0);
}

// Modifica di una visita esistente
function editVisit(index) {
    const visit = visits[index];
    if (!visit) return;

    currentEditIndex = index;

    // Imposta i valori nel form
    document.getElementById("orderDate").value = visit.date;
    document.getElementById("orderNote").value = visit.note;
    document.getElementById("numeroPreventivo").value = visit.numeroPreventivo;
    document.getElementById("validitaPreventivo").value = visit.validitaPreventivo;

    // Seleziona il cliente
    const clientSelect = document.getElementById("orderPotentialClientsList");
    Array.from(clientSelect.options).forEach(option => {
        option.selected = parseInt(option.value, 10) === visit.client.id;
    });
    selectClients();

    // Aggiorna il totale
    document.getElementById("totalArticlesValue").textContent = formatEuro(visit.total);
}

// Eliminazione di una visita
function deleteVisit(index) {
    if (confirm("Sei sicuro di voler eliminare questa visita?")) {
        visits.splice(index, 1);
        saveVisits();
        populateVisitsTable(visits);
        alert("Visita eliminata con successo.");
    }
}

// Esportazione delle visite in CSV compatibile con Google My Maps
function exportToCSVForMyMaps() {
    if (visits.length === 0) {
        alert("Nessuna visita disponibile per l'esportazione.");
        return;
    }

    const csvRows = [
        ["Nominativo", "Indirizzo", "Città", "Regione", "Telefono", "Data", "Nota", "Totale"]
    ];

    visits.forEach(visit => {
        csvRows.push([
            `"${visit.client.nominativo.replace(/"/g, '""')}"`,
            `"${visit.client.indirizzo.replace(/"/g, '""')}"`,
            `"${visit.client.città.replace(/"/g, '""')}"`,
            `"${visit.client.Regione.replace(/"/g, '""')}"`,
            `"${visit.client.telefono.replace(/"/g, '""')}"`,
            `${formatDateEuropean(visit.date)}`,
            `"${visit.note.replace(/"/g, '""')}"`,
            `"${formatEuro(visit.total)}"`
        ]);
    });

    const csvContent = csvRows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Visite_Clienti_MyMaps.csv";
    link.click();
}

// Esportazione delle visite in JSON
function exportVisitsToJSON() {
    const jsonContent = JSON.stringify(visits, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "visite.json";
    a.click();
    URL.revokeObjectURL(url);
}

// Importazione delle visite da un file JSON
document.getElementById('importJSONFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                visits = importedData;
                saveVisits();
                populateVisitsTable(visits);
                alert("Visite importate con successo!");
            } else {
                alert("Il file JSON non è valido.");
            }
        } catch (err) {
            alert("Errore durante l'importazione del file JSON.");
        }
    };
    reader.readAsText(file);
});

// Pulsante per aggiornare automaticamente la PWA quando è disponibile una nuova versione
window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js').then(registration => {
            console.log('Service Worker registrato con successo:', registration);

            registration.onupdatefound = () => {
                const installingWorker = registration.installing;
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            // Nuovo contenuto disponibile
                            showUpdateButton();
                        }
                    }
                };
            };
        }).catch(error => {
            console.error('Service Worker registration failed:', error);
        });
    }
});

// Mostra il pulsante di aggiornamento
function showUpdateButton() {
    const updateBtn = document.createElement('button');
    updateBtn.textContent = 'Aggiorna App';
    updateBtn.className = 'update-btn no-print';
    updateBtn.style.position = 'fixed';
    updateBtn.style.bottom = '20px';
    updateBtn.style.right = '20px';
    updateBtn.style.padding = '10px 20px';
    updateBtn.style.backgroundColor = '#ff9800';
    updateBtn.style.color = '#fff';
    updateBtn.style.border = 'none';
    updateBtn.style.borderRadius = '5px';
    updateBtn.style.cursor = 'pointer';
    updateBtn.style.zIndex = '1001';

    updateBtn.addEventListener('click', () => {
        window.location.reload();
    });

    document.body.appendChild(updateBtn);
}

// Funzione per pulire la cache (se necessario)
function clearCache() {
    if ('caches' in window) {
        caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
                if (cacheName.startsWith('planVisite-')) {
                    caches.delete(cacheName);
                }
            });
        });
    }
}

// Chiamata alla funzione di pulizia della cache al caricamento
window.addEventListener('load', () => {
    clearCache();
});

// Event listener per la selezione dei clienti
document.getElementById("orderSearchClientPotential").addEventListener("input", filterClients);
document.getElementById("orderPotentialClientsList").addEventListener("change", selectClients);

// Event listener per il salvataggio delle visite
document.querySelector('.save-btn').addEventListener('click', saveVisitData);

// Event listener per l'esportazione in CSV per My Maps
document.querySelector('.export-btn').addEventListener('click', exportToCSVForMyMaps);

// Event listener per l'esportazione in JSON
document.querySelector('.export-btn').addEventListener('click', exportVisitsToJSON);

// Event listener per l'importazione da JSON
document.querySelector('.export-btn').addEventListener('click', () => {
    document.getElementById('importJSONFile').click();
});

// Assicurati di avere i pulsanti corretti nel tuo HTML con le classi appropriate
// Ad esempio, per il pulsante di aggiornamento automatico, l'updateBtn viene creato dinamicamente
