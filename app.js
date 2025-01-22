// app.js

document.addEventListener('DOMContentLoaded', () => {
    loadClientsFromLocalStorage();
    loadVisitPlansFromLocalStorage();

    document.getElementById('csvFileInput').addEventListener('change', loadClientsFromCSV);
    document.getElementById('addClientButton').addEventListener('click', addNewClient);
    document.getElementById('planVisitButton').addEventListener('click', planVisit);
    document.getElementById('exportCSVButton').addEventListener('click', exportVisitPlansToCSV);
    document.getElementById('searchClientInput').addEventListener('input', filterClients);

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(() => console.log('Service Worker registered successfully.'))
            .catch(err => console.error('Service Worker registration failed:', err));
    }
});

// Variables
let clients = [];
let visitPlans = [];
let nextClientId = 0;

// Load clients from CSV
function loadClientsFromCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const csvData = e.target.result.trim().split("\n");
        csvData.slice(1).forEach(line => {
            const fields = line.split(";").map(field => field.trim());
            if (fields.length >= 3) {
                clients.push({ id: nextClientId++, name: fields[0], address: fields[1], city: fields[2] });
            }
        });
        saveClientsToLocalStorage();
        populateClientList();
        alert("Clienti caricati dal CSV con successo!");
    };
    reader.readAsText(file);
}

// Save and load clients to/from localStorage
function saveClientsToLocalStorage() {
    localStorage.setItem("clients", JSON.stringify(clients));
}

function loadClientsFromLocalStorage() {
    const storedClients = JSON.parse(localStorage.getItem("clients")) || [];
    clients = storedClients;
    nextClientId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 0;
    populateClientList();
}

// Add a new client
function addNewClient() {
    const name = document.getElementById("newClientName").value.trim();
    const address = document.getElementById("newClientAddress").value.trim();
    const city = document.getElementById("newClientCity").value.trim();

    if (!name || !address || !city) {
        alert("Inserisci Nome, Indirizzo e Città per il cliente.");
        return;
    }

    const visitDate = prompt("Inserisci la data (YYYY-MM-DD) per pianificare la visita di questo cliente:");
    if (!visitDate || isNaN(new Date(visitDate).getTime())) {
        alert("Data non valida. Cliente non aggiunto.");
        return;
    }

    const newClient = { id: nextClientId++, name, address, city };
    clients.push(newClient);
    saveClientsToLocalStorage();
    populateClientList();

    // Pianifica immediatamente la visita
    visitPlans.push({ date: visitDate, clients: [newClient] });
    saveVisitPlansToLocalStorage();
    populateVisitPlanTable();

    document.getElementById("newClientForm").reset();
    alert(`Cliente aggiunto e visita pianificata per il ${visitDate}!`);
}

// Populate the client list in the selection dropdown
function populateClientList() {
    const clientList = document.getElementById("clientList");
    const query = document.getElementById("searchClientInput").value.toLowerCase();
    const filteredClients = query
        ? clients.filter(client => client.name.toLowerCase().includes(query) || client.city.toLowerCase().includes(query))
        : clients;

    clientList.innerHTML = "";

    filteredClients.forEach(client => {
        const option = document.createElement("option");
        option.value = client.id;
        option.textContent = `${client.name} - ${client.city}`;
        clientList.appendChild(option);
    });
}

// Filter clients for searching
function filterClients() {
    populateClientList();
}

// Plan a visit
function planVisit() {
    const selectedClientIds = Array.from(document.getElementById("clientList").selectedOptions).map(opt => parseInt(opt.value));
    const visitDate = document.getElementById("visitDate").value;

    if (!visitDate) {
        alert("Seleziona una data per la visita.");
        return;
    }

    if (selectedClientIds.length === 0) {
        alert("Seleziona almeno un cliente per pianificare una visita.");
        return;
    }

    const selectedClients = clients.filter(client => selectedClientIds.includes(client.id));
    visitPlans.push({ date: visitDate, clients: selectedClients });

    saveVisitPlansToLocalStorage();
    populateVisitPlanTable();
    alert("Visita pianificata con successo!");
}

// Save and load visit plans to/from localStorage
function saveVisitPlansToLocalStorage() {
    localStorage.setItem("visitPlans", JSON.stringify(visitPlans));
}

function loadVisitPlansFromLocalStorage() {
    visitPlans = JSON.parse(localStorage.getItem("visitPlans")) || [];
    populateVisitPlanTable();
}

// Populate the visit plan table
function populateVisitPlanTable() {
    const tableBody = document.getElementById("visitPlanTableBody");
    tableBody.innerHTML = "";

    visitPlans.forEach((plan, index) => {
        const row = document.createElement("tr");
        const clientsText = plan.clients.map(client => `${client.name} (${client.city})`).join(", ");
        row.innerHTML = `
            <td>${plan.date}</td>
            <td>${clientsText}</td>
            <td><button onclick="deleteVisitPlan(${index})">Elimina</button></td>
        `;
        tableBody.appendChild(row);
    });
}

// Delete a visit plan
function deleteVisitPlan(index) {
    visitPlans.splice(index, 1);
    saveVisitPlansToLocalStorage();
    populateVisitPlanTable();
}

// Export visit plans to CSV
function exportVisitPlansToCSV() {
    if (visitPlans.length === 0) {
        alert("Non ci sono visite pianificate da esportare.");
        return;
    }

    const csvRows = ["Data,Cliente,Indirizzo,Città"];
    visitPlans.forEach(plan => {
        plan.clients.forEach(client => {
            csvRows.push(`${plan.date},"${client.name}","${client.address}","${client.city}"`);
        });
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "visite_pianificate.csv";
    link.click();
}
