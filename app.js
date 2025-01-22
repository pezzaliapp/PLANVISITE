document.addEventListener('DOMContentLoaded', () => {
    loadClientsFromLocalStorage();
    loadVisitPlansFromLocalStorage();

    document.getElementById('csvFileInput').addEventListener('change', loadClientsFromCSV);
    document.getElementById('addClientButton').addEventListener('click', addNewClient);
    document.getElementById('planVisitButton').addEventListener('click', planVisit);
    document.getElementById('exportCSVButton').addEventListener('click', exportVisitPlansToCSV);

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

// Functions for managing clients
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
    populateClientList();
}

function addNewClient() {
    const name = document.getElementById("newClientName").value.trim();
    const address = document.getElementById("newClientAddress").value.trim();
    const city = document.getElementById("newClientCity").value.trim();

    if (!name || !address || !city) {
        alert("Please enter Name, Address, and City for the client.");
        return;
    }

    clients.push({ id: nextClientId++, name, address, city });
    saveClientsToLocalStorage();
    populateClientList();
    document.getElementById("newClientForm").reset();
    alert("Client added successfully!");
}

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

// Functions for managing visits
function planVisit() {
    const selectedClientIds = Array.from(document.getElementById("clientList").selectedOptions).map(opt => parseInt(opt.value));
    const visitDate = document.getElementById("visitDate").value;

    if (!visitDate) {
        alert("Please select a date for the visit.");
        return;
    }

    if (selectedClientIds.length === 0) {
        alert("Please select at least one client to plan a visit.");
        return;
    }

    const selectedClients = clients.filter(client => selectedClientIds.includes(client.id));
    visitPlans.push({ date: visitDate, clients: selectedClients });

    saveVisitPlansToLocalStorage();
    populateVisitPlanTable();
    alert("Visit planned successfully!");
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
            <td><button onclick="deleteVisitPlan(${index})">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });
}

function deleteVisitPlan(index) {
    visitPlans.splice(index, 1);
    saveVisitPlansToLocalStorage();
    populateVisitPlanTable();
}

function exportVisitPlansToCSV() {
    if (visitPlans.length === 0) {
        alert("No visits planned to export.");
        return;
    }

    const csvRows = ["Date,Client,Address,City"];
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
