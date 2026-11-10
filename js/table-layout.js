// =====================================
// RESTRO TABLE LAYOUT SYSTEM
// =====================================


// 1. GET TABLES

function getTables() {

    return JSON.parse(
        localStorage.getItem("restaurantTables")
    ) || [];

}


// 2. GET BOOKINGS

function getBookings() {

    return JSON.parse(
        localStorage.getItem("restaurantBookings")
    ) || [];

}


// 3. DETERMINE TABLE STATUS

function getTableStatus(table) {

    const date = document.getElementById("layoutDate").value;

    const time = document.getElementById("layoutTime").value;

    const bookings = getBookings();


    // Out of service has highest priority.

    if (table.status === "Out of Service") {
        return "Out of Service";
    }


    // Find booking for selected date and time.

    const booking = bookings.find(b => {

        return (
            b.table === table.id &&
            b.date === date &&
            b.time === time &&
            !["Cancelled", "No-Show"].includes(b.status)
        );

    });


    if (booking) {

        if (booking.status === "Seated") {
            return "Occupied";
        }

        return "Reserved";

    }


    // Use manually maintained table status.

    if (
        table.status === "Occupied" ||
        table.status === "Reserved"
    ) {
        return table.status;
    }

    return "Available";

}


// 4. DISPLAY TABLES

function renderLayout() {

    const tables = getTables();

    const indoor = document.getElementById("indoorTables");

    const outdoor = document.getElementById("outdoorTables");

    const filter = document.getElementById("layoutFilter").value;


    indoor.innerHTML = "";

    outdoor.innerHTML = "";


    let available = 0;

    let reserved = 0;

    let occupied = 0;

    let outOfService = 0;


    tables.forEach(table => {

        const status = getTableStatus(table);


        // Statistics

        if (status === "Available") available++;

        if (status === "Reserved") reserved++;

        if (status === "Occupied") occupied++;

        if (status === "Out of Service") outOfService++;


        if (filter !== "All" && status !== filter) {
            return;
        }


        const div = document.createElement("div");


        const statusClass = status.toLowerCase().replaceAll(" ", "-");


        div.className = `floor-table ${statusClass}`;


        div.innerHTML = `

            <i data-lucide="armchair"></i>

            <strong>${escapeHTML(table.id)}</strong>

            <small>${Number(table.capacity)} Seater</small>

            <small>${escapeHTML(status)}</small>

        `;


        div.addEventListener("click", () => {

            showTableDetails(table);

        });


        // Detect location

        const location = (table.location || "").toLowerCase();

        if (location.includes("outdoor")) {

            outdoor.appendChild(div);

        } else {

            indoor.appendChild(div);

        }

    });


    // UPDATE STATISTICS

    document.getElementById("totalTables").textContent =
        tables.length;

    document.getElementById("availableTables").textContent =
        available;

    document.getElementById("reservedTables").textContent =
        reserved;

    document.getElementById("occupiedTables").textContent =
        occupied;


    document.getElementById("noTables").hidden =
        tables.length !== 0;


    // Hide empty sections when filtering.

    document.querySelectorAll(".floor-section").forEach(section => {

        const grid = section.querySelector(".table-grid");

        section.hidden = grid.children.length === 0;

    });


    lucide.createIcons();

}


// 5. SHOW TABLE DETAILS

function showTableDetails(table) {

    const status = getTableStatus(table);

    const bookings = getBookings();


    const booking = bookings.find(b => {

        return (
            b.table === table.id &&
            b.date === document.getElementById("layoutDate").value &&
            b.time === document.getElementById("layoutTime").value &&
            !["Cancelled", "No-Show"].includes(b.status)
        );

    });


    const details = document.getElementById("tableDetails");


    details.innerHTML = `

        <div class="table-detail-card">

            <h3>${escapeHTML(table.id)}</h3>

            <p>
                <strong>Type:</strong>
                ${escapeHTML(table.type || "Standard")}
            </p>

            <p>
                <strong>Capacity:</strong>
                ${Number(table.capacity)} Guests
            </p>

            <p>
                <strong>Location:</strong>
                ${escapeHTML(table.location || "Indoor")}
            </p>

            <p>
                <strong>Status:</strong>
                ${escapeHTML(status)}
            </p>

            ${
                booking
                ? `
                    <hr>

                    <p>
                        <strong>Customer:</strong>
                        ${escapeHTML(booking.name)}
                    </p>

                    <p>
                        <strong>Guests:</strong>
                        ${Number(booking.guests)}
                    </p>

                    <p>
                        <strong>Time:</strong>
                        ${escapeHTML(booking.time)}
                    </p>
                `
                : "<p>No matching booking for this date and time.</p>"
            }

        </div>

    `;


    document.getElementById("tableDetailsModal")
        .classList.add("show");

}


// 6. CLOSE DETAILS

function closeTableDetails() {

    document.getElementById("tableDetailsModal")
        .classList.remove("show");

}


// 7. HTML SECURITY

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, character => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"

    })[character]);

}


// 8. DATE AND TIME DEFAULTS

function initializeLayout() {

    const now = new Date();

    const date = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");

    const time = [
        String(now.getHours()).padStart(2, "0"),
        String(now.getMinutes()).padStart(2, "0")
    ].join(":");


    document.getElementById("layoutDate").value = date;

    document.getElementById("layoutTime").value = time;


    renderLayout();

}


// 9. FILTER EVENTS

document.getElementById("layoutFilter")
    .addEventListener("change", renderLayout);

document.getElementById("layoutDate")
    .addEventListener("change", renderLayout);

document.getElementById("layoutTime")
    .addEventListener("change", renderLayout);


// 10. INITIALIZE

initializeLayout();