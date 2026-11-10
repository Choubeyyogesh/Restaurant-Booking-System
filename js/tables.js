// =================================
// RESTAURANT TABLE MANAGEMENT
// =================================


// 1. INITIAL TABLE DATA

const defaultTables = [
    {
        id: "T-01",
        type: "Normal",
        capacity: 2,
        location: "Indoor",
        status: "Available"
    },
    {
        id: "T-02",
        type: "Normal",
        capacity: 4,
        location: "Indoor",
        status: "Reserved"
    },
    {
        id: "T-03",
        type: "VIP",
        capacity: 6,
        location: "Private Room",
        status: "Occupied"
    },
    {
        id: "T-04",
        type: "Outdoor",
        capacity: 4,
        location: "Outdoor",
        status: "Available"
    },
    {
        id: "T-05",
        type: "Normal",
        capacity: 8,
        location: "Indoor",
        status: "Out of Service"
    }
];


// 2. LOAD DATA FROM LOCAL STORAGE

let tables = JSON.parse(
    localStorage.getItem("restaurantTables")
);

if (!Array.isArray(tables)) {
    tables = defaultTables;
    saveTables();
}


// 3. SAVE DATA

function saveTables() {

    localStorage.setItem(
        "restaurantTables",
        JSON.stringify(tables)
    );

}


// 4. DISPLAY TABLES

function displayTables() {

    const tableBody = document.getElementById("tableBody");

    const search = document
        .getElementById("searchTable")
        .value.toLowerCase();

    const filter = document
        .getElementById("statusFilter")
        .value;

    const filteredTables = tables.filter(table => {

        const matchesSearch =
            table.id.toLowerCase().includes(search) ||
            table.type.toLowerCase().includes(search) ||
            table.location.toLowerCase().includes(search);

        const matchesStatus =
            filter === "All" || table.status === filter;

        return matchesSearch && matchesStatus;

    });


    tableBody.innerHTML = "";

    filteredTables.forEach(table => {

        const row = document.createElement("tr");

        const statusClass = {
            "Available": "status-available",
            "Reserved": "status-reserved",
            "Occupied": "status-occupied",
            "Out of Service": "status-out-of-service"
        }[table.status];

        row.innerHTML = `
            <td><strong>${escapeHTML(table.id)}</strong></td>

            <td>${escapeHTML(table.type)}</td>

            <td>${Number(table.capacity)} Seater</td>

            <td>${escapeHTML(table.location)}</td>

            <td>
                <span class="status-badge ${statusClass}">
                    ${escapeHTML(table.status)}
                </span>
            </td>

            <td>
                <div class="action-buttons">

                    <button class="action-btn"
                        onclick="editTable('${encodeURIComponent(table.id)}')"
                        title="Edit">
                        <i data-lucide="pencil"></i>
                    </button>

                    <button class="action-btn delete-btn"
                        onclick="deleteTable('${encodeURIComponent(table.id)}')"
                        title="Delete">
                        <i data-lucide="trash-2"></i>
                    </button>

                </div>
            </td>
        `;

        tableBody.appendChild(row);

    });


    document.getElementById("emptyMessage").hidden =
        filteredTables.length !== 0;

    updateStatistics();

    lucide.createIcons();

}


// Escape user-entered text before displaying it in HTML.

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);

}


// 5. UPDATE STATISTICS

function updateStatistics() {

    document.getElementById("totalTables").textContent =
        tables.length;

    document.getElementById("availableTables").textContent =
        tables.filter(t => t.status === "Available").length;

    document.getElementById("reservedTables").textContent =
        tables.filter(t => t.status === "Reserved").length;

    document.getElementById("occupiedTables").textContent =
        tables.filter(t => t.status === "Occupied").length;

}


// 6. OPEN MODAL

function openModal() {

    document.getElementById("tableForm").reset();

    document.getElementById("editId").value = "";

    document.getElementById("modalTitle").textContent =
        "Add New Table";

    document.getElementById("tableModal")
        .classList.add("show");

}


// 7. CLOSE MODAL

function closeModal() {

    document.getElementById("tableModal")
        .classList.remove("show");

}


// 8. ADD / UPDATE TABLE

document.getElementById("tableForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const oldId = document.getElementById("editId").value;

        const id = document.getElementById("tableName")
            .value.trim();

        const type = document.getElementById("tableType").value;

        const capacity = Number(
            document.getElementById("capacity").value
        );

        const location = document.getElementById("location").value;

        const status = document.getElementById("tableStatus").value;


        if (!id) {
            alert("Please enter a table ID.");
            return;
        }


        // Check duplicate IDs

        const duplicate = tables.some(table =>
            table.id.toLowerCase() === id.toLowerCase() &&
            table.id !== oldId
        );

        if (duplicate) {
            alert("This Table ID already exists!");
            return;
        }


        const tableData = {
            id,
            type,
            capacity,
            location,
            status
        };


        if (oldId) {

            const index = tables.findIndex(
                table => table.id === oldId
            );

            if (index !== -1) {
                tables[index] = tableData;
            }

        } else {

            tables.push(tableData);

        }


        saveTables();

        displayTables();

        closeModal();

        alert(oldId
            ? "Table updated successfully!"
            : "New table added successfully!"
        );

    });


// 9. EDIT TABLE

function editTable(encodedId) {

    const id = decodeURIComponent(encodedId);

    const table = tables.find(t => t.id === id);

    if (!table) return;

    document.getElementById("editId").value = table.id;

    document.getElementById("tableName").value = table.id;

    document.getElementById("tableType").value = table.type;

    document.getElementById("capacity").value = table.capacity;

    document.getElementById("location").value = table.location;

    document.getElementById("tableStatus").value = table.status;

    document.getElementById("modalTitle").textContent =
        "Edit Table";

    document.getElementById("tableModal")
        .classList.add("show");

}


// 10. DELETE TABLE

function deleteTable(encodedId) {

    const id = decodeURIComponent(encodedId);

    const confirmDelete = confirm(
        `Are you sure you want to delete ${id}?`
    );

    if (!confirmDelete) return;

    tables = tables.filter(table => table.id !== id);

    saveTables();

    displayTables();

}


// 11. SEARCH AND FILTER

document.getElementById("searchTable")
    .addEventListener("input", displayTables);

document.getElementById("statusFilter")
    .addEventListener("change", displayTables);


// 12. INITIALIZE

displayTables();