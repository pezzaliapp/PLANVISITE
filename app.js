// app.js

document.addEventListener('DOMContentLoaded', () => {
    loadClientsFromLocalStorage();
    loadVisitPlansFromLocalStorage();

    document.getElementById('csvFileInput').addEventListener('change', loadClientsFromCSV);
    document.getElementById('addClientButton').addEventListener('click', addNewClient);
    document.getElementById('planVisitButton').addEventListener('click', planVisit);
    document.getElementById('exportCSVButton').addEventListener('click', exportVisitPlansToCSV);
});

// Variabili globali
let clients = [];
let visitPlans = [];
let nextClientId = 0;

// Carica clienti da CSV
function loadClientsFromCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const csvData = e.target.result.trim().split("\n");
        csvData.slice(1).forEach(line => {
            const fields = line.split(";").map(field => field.trim());
            if (fields.length >= 3) {
                clients.push({
                    id: nextClientId++,
                    name: fields[0],
                    address: fields[1],
                    city: fields[2],
                });
            }
        });
        saveClientsToLocalStorage();
        populateClientList();
    };
    reader.readAsText(file);
}

// Salva i clienti nel localStorage
function saveClientsToLocalStorage() {
    localStorage.setItem("clients", JSON.stringify(clients));
}

// Carica i clienti dal localStorage
function loadClientsFromLocalStorage() {
    const storedClients = JSON.parse(localStorage.getItem("clients")) || [];
    clients = storedClients;
    nextClientId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 0;
    populateClientList();
}

// Aggiungi un nuovo cliente
function addNewClient() {
    const name = document.getElementById("newClientName").value.trim();
    const address = document.getElementById("newClientAddress").value.trim();
    const city = document.getElementById("newClientCity").value.trim();

    if (!name || !address || !city) {
        alert("Inserisci Nome, Indirizzo e Città per il cliente.");
        return;
    }

    clients.push({ id: nextClientId++, name, address, city });
    saveClientsToLocalStorage();
    populateClientList();
    document.getElementById("newClientForm").reset();
    alert("Cliente aggiunto con successo!");
}

// Popola la lista dei clienti
function populateClientList() {
    const clientList = document.getElementById("clientList");
    clientList.innerHTML = "";

    clients.forEach(client => {
        const option = document.createElement("option");
        option.value = client.id;
        option.textContent = `${client.name} - ${client.city}`;
        clientList.appendChild(option);
    });
}

// Pianifica una visita
function planVisit() {
    const selectedClientIds = Array.from(document.getElementById("clientList").selectedOptions).map(opt => parseInt(opt.value));
    const visitDate = document.getElementById("visitDate").value;

    if (!visitDate) {
        alert("Inserisci una data per la visita.");
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

// Salva i piani di visita nel localStorage
function saveVisitPlansToLocalStorage() {
    localStorage.setItem("visitPlans", JSON.stringify(visitPlans));
}

// Carica i piani di visita dal localStorage
function loadVisitPlansFromLocalStorage() {
    visitPlans = JSON.parse(localStorage.getItem("visitPlans")) || [];
    populateVisitPlanTable();
}

// Popola la tabella delle visite pianificate
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

// Elimina un piano di visita
function deleteVisitPlan(index) {
    visitPlans.splice(index, 1);
    saveVisitPlansToLocalStorage();
    populateVisitPlanTable();
    alert("Visita eliminata con successo.");
}

// Esporta le visite in CSV per Google My Maps
function exportVisitPlansToCSV() {
    if (visitPlans.length === 0) {
        alert("Nessuna visita pianificata da esportare.");
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
    link.download = "visit_plans.csv";
    link.click();
}
