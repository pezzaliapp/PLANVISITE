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

let clients = [];
let filteredClients = [];
let visitPlans = [];
let nextClientId = 0;

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
                    region: fields[3] || '', // Regione opzionale
                    phone: fields[4] || ''  // Telefono opzionale
                });
            }
        });
        saveClientsToLocalStorage();
        filteredClients = [...clients];
        populateClientList();
    };
    reader.readAsText(file);
}

function saveClientsToLocalStorage() {
    localStorage.setItem("clients", JSON.stringify(clients));
}

function loadClientsFromLocalStorage() {
    const storedClients = JSON.parse(localStorage.getItem("clients")) || [];
    clients = storedClients;
    filteredClients = [...clients];
    nextClientId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 0;
    populateClientList();
}

function addNewClient() {
    const name = document.getElementById("newClientName").value.trim();
    const address = document.getElementById("newClientAddress").value.trim();
    const city = document.getElementById("newClientCity").value.trim();
    const region = document.getElementById("newClientRegion").value.trim(); // Regione
    const phone = document.getElementById("newClientPhone").value.trim(); // Telefono

    if (!name || !address || !city) {
        alert("Per favore, compila almeno Nome, Indirizzo e Città.");
        return;
    }

    clients.push({ id: nextClientId++, name, address, city, region, phone });
    saveClientsToLocalStorage();
    filteredClients = [...clients];
    populateClientList();
    document.getElementById("newClientForm").reset();
    alert("Cliente aggiunto con successo!");
}

function populateClientList() {
    const clientList = document.getElementById("clientList");
    clientList.innerHTML = "";

    filteredClients.forEach(client => {
        const option = document.createElement("option");
        option.value = client.id;
        option.textContent = `${client.name} - ${client.city}`;
        if (client.region) option.textContent += ` (${client.region})`;
        if (client.phone) option.textContent += ` - Tel: ${client.phone}`;
        clientList.appendChild(option);
    });
}

function filterClients() {
    const query = document.getElementById("searchClientInput").value.toLowerCase();
    filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(query) ||
        client.city.toLowerCase().includes(query) ||
        client.address.toLowerCase().includes(query) ||
        client.region.toLowerCase().includes(query) ||
        client.phone.toLowerCase().includes(query)
    );
    populateClientList();
}

function planVisit() {
    const selectedClientIds = Array.from(document.getElementById("clientList").selectedOptions).map(opt => parseInt(opt.value));
    const visitDate = document.getElementById("visitDate").value;

    if (!visitDate) {
        alert("Per favore, seleziona una data per la visita.");
        return;
    }

    if (selectedClientIds.length === 0) {
        alert("Per favore, seleziona almeno un cliente.");
        return;
    }

    const selectedClients = clients.filter(client => selectedClientIds.includes(client.id));
    visitPlans.push({ date: visitDate, clients: selectedClients });

    saveVisitPlansToLocalStorage();
    populateVisitPlanTable();
    alert("Visita pianificata con successo!");
}

function saveVisitPlansToLocalStorage() {
    localStorage.setItem("visitPlans", JSON.stringify(visitPlans));
}

function loadVisitPlansFromLocalStorage() {
    visitPlans = JSON.parse(localStorage.getItem("visitPlans")) || [];
    populateVisitPlanTable();
}

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

function deleteVisitPlan(index) {
    visitPlans.splice(index, 1);
    saveVisitPlansToLocalStorage();
    populateVisitPlanTable();
    alert("Visita eliminata con successo.");
}

function exportVisitPlansToCSV() {
    if (visitPlans.length === 0) {
        alert("Nessuna visita pianificata da esportare.");
        return;
    }

    const csvRows = ["Data,Cliente,Indirizzo,Città,Regione,Telefono"];

    visitPlans.forEach(plan => {
        plan.clients.forEach(client => {
            csvRows.push(`${plan.date},"${client.name}","${client.address}","${client.city}","${client.region || ''}","${client.phone || ''}"`);
        });
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "visit_plans.csv";
    link.click();
}
