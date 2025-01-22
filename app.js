document.addEventListener('DOMContentLoaded', () => {
    loadClientsFromLocalStorage();
    loadVisitPlansFromLocalStorage();

    document.getElementById('csvFileInput').addEventListener('change', loadClientsFromCSV);
    document.getElementById('addClientButton').addEventListener('click', addNewClient);
    document.getElementById('searchClientInput').addEventListener('input', searchClients);
    document.getElementById('planVisitButton').addEventListener('click', planVisit);
    document.getElementById('exportCSVButton').addEventListener('click', exportVisitPlansToCSV);

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(() => console.log('Service Worker registered successfully.'))
            .catch(err => console.error('Service Worker registration failed:', err));
    }
});

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    const installButton = document.getElementById('installAppButton');
    installButton.style.display = 'block';

    installButton.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('PWA installata con successo!');
            } else {
                console.log('Installazione annullata.');
            }
            deferredPrompt = null;
            installButton.style.display = 'none';
        });
    });
});

let clients = [];
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
                    region: fields[3] || '',
                    phone: fields[4] || ''
                });
            }
        });
        saveClientsToLocalStorage();
        populateClientList(clients);
    };
    reader.readAsText(file);
}

function saveClientsToLocalStorage() {
    localStorage.setItem("clients", JSON.stringify(clients));
}

function loadClientsFromLocalStorage() {
    const storedClients = JSON.parse(localStorage.getItem("clients")) || [];
    clients = storedClients;
    nextClientId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 0;
    populateClientList(clients);
}

function addNewClient() {
    const name = document.getElementById("newClientName").value.trim();
    const address = document.getElementById("newClientAddress").value.trim();
    const city = document.getElementById("newClientCity").value.trim();
    const region = document.getElementById("newClientRegion").value.trim();
    const phone = document.getElementById("newClientPhone").value.trim();

    if (!name || !address || !city) {
        alert("Per favore, compila Nome, Indirizzo e Città.");
        return;
    }

    clients.push({ id: nextClientId++, name, address, city, region, phone });
    saveClientsToLocalStorage();
    populateClientList(clients);
    document.getElementById("newClientForm").reset();
    alert("Cliente aggiunto con successo!");
}

function searchClients() {
    const query = document.getElementById("searchClientInput").value.toLowerCase();
    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(query) ||
        client.address.toLowerCase().includes(query) ||
        client.city.toLowerCase().includes(query)
    );
    populateClientList(filteredClients);
}

function populateClientList(filteredClients) {
    const clientList = document.getElementById("clientList");
    clientList.innerHTML = "";

    filteredClients.forEach(client => {
        const li = document.createElement("li");
        li.textContent = `${client.name} - ${client.city} ${client.region ? `- ${client.region}` : ''} ${client.phone ? `- Tel: ${client.phone}` : ''}`;
        clientList.appendChild(li);
    });
}

function planVisit() {
    const visitDate = document.getElementById("visitDate").value;

    if (!visitDate) {
        alert("Seleziona una data per la visita.");
        return;
    }

    visitPlans.push({ date: visitDate, clients });
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
