// ======================================
// RESTRO AVAILABILITY SYSTEM
// ======================================


// GET EXISTING DATA

function getTables() {

    return JSON.parse(
        localStorage.getItem("restaurantTables")
    ) || [];

}


function getBookings() {

    return JSON.parse(
        localStorage.getItem("restaurantBookings")
    ) || [];

}


// SELECTED TABLE

let selectedTable = null;


// BOOKING DURATION (90 MINUTES)

const BOOKING_DURATION = 90;


// CONVERT TIME INTO MINUTES

function timeToMinutes(time) {

    const [hours, minutes] = time.split(":").map(Number);

    return hours * 60 + minutes;

}


// CHECK OVERLAPPING BOOKINGS

function isTableAvailable(table, date, time) {

    const tables = getTables();

    const bookings = getBookings();

    const requestedStart = timeToMinutes(time);

    const requestedEnd = requestedStart + BOOKING_DURATION;


    // Check manually occupied tables.

    if (
        table.status === "Occupied" ||
        table.status === "Out of Service"
    ) {
        return false;
    }


    // Check existing reservations.

    const conflictingBooking = bookings.some(booking => {

        if (
            String(booking.table) !== String(table.id) ||
            booking.date !== date ||
            ["Cancelled", "No-Show"].includes(booking.status)
        ) {
            return false;
        }


        const existingStart = timeToMinutes(booking.time);

        const existingEnd = existingStart + BOOKING_DURATION;


        return (
            requestedStart < existingEnd &&
            requestedEnd > existingStart
        );

    });


    return !conflictingBooking;

}


// CHECK AVAILABILITY

function checkAvailability(event) {

    event.preventDefault();


    const date = document.getElementById("bookingDate").value;

    const time = document.getElementById("bookingTime").value;

    const guests = Number(
        document.getElementById("guestCount").value
    );


    if (!date || !time || guests < 1) {

        alert("Please enter valid booking details.");

        return;

    }


    const requestedDate = new Date(date + "T00:00:00");

    const today = new Date();

    today.setHours(0, 0, 0, 0);


    if (requestedDate < today) {

        alert("Please select today or a future date.");

        return;

    }


    const now = new Date();

    if (
        date === getTodayDate() &&
        timeToMinutes(time) <= now.getHours() * 60 + now.getMinutes()
    ) {

        alert("Please select a future time.");

        return;

    }


    const tables = getTables();


    const availableTables = tables.filter(table => {

        return (
            Number(table.capacity) >= guests &&
            isTableAvailable(table, date, time)
        );

    });


    displayAvailableTables(availableTables, date, time, guests);

}


// DISPLAY RESULTS

function displayAvailableTables(tables, date, time, guests) {

    const container =
        document.getElementById("availabilityResults");


    container.innerHTML = "";


    document.getElementById("availableCount")
        .textContent = `${tables.length} Tables`;


    document.getElementById("availabilityMessage")
        .textContent = `${guests} Guests | ${date} | ${time}`;


    document.getElementById("emptyAvailability").hidden =
        tables.length !== 0;


    if (tables.length === 0) {

        document.getElementById("emptyAvailability").textContent =
            "Sorry! No suitable tables available for your selected time.";

        return;

    }


    document.getElementById("emptyAvailability").hidden = true;


    tables.forEach(table => {

        const card = document.createElement("div");

        card.className = "availability-table";


        card.innerHTML = `

            <i data-lucide="armchair"></i>

            <h3>${escapeHTML(table.id)}</h3>

            <p>Capacity: ${Number(table.capacity)} Guests</p>

            <p>Location: ${escapeHTML(table.location || "Indoor")}</p>

            <span class="availability-badge">
                Available
            </span>

            <button class="primary-btn">
                Book This Table
            </button>

        `;


        card.querySelector("button").addEventListener("click", () => {

            openAvailabilityModal(table, date, time, guests);

        });


        container.appendChild(card);

    });


    lucide.createIcons();

}


// OPEN BOOKING MODAL

function openAvailabilityModal(table, date, time, guests) {

    selectedTable = {
        table,
        date,
        time,
        guests
    };


    document.getElementById("availabilityDetails").innerHTML = `

        <div class="table-detail-card">

            <h3>Reservation Details</h3>

            <p>Table: ${escapeHTML(table.id)}</p>

            <p>Date: ${escapeHTML(date)}</p>

            <p>Time: ${escapeHTML(time)}</p>

            <p>Guests: ${guests}</p>

        </div>

    `;


    document.getElementById("availabilityModal")
        .classList.add("show");

}


// CLOSE MODAL

function closeAvailabilityModal() {

    document.getElementById("availabilityModal")
        .classList.remove("show");

}


// CONFIRM BOOKING

document.getElementById("quickBookingForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        if (!selectedTable) return;


        const name = document.getElementById("customerName").value.trim();

        const phone = document.getElementById("customerPhone").value.trim();


        if (!name || !/^[0-9]{10}$/.test(phone)) {

            alert("Enter a valid name and 10-digit phone number.");

            return;

        }


        // RECHECK AVAILABILITY BEFORE SAVING

        const tables = getTables();

        const table = tables.find(t =>
            String(t.id) === String(selectedTable.table.id)
        );


        if (
            !table ||
            Number(table.capacity) < selectedTable.guests ||
            !isTableAvailable(
                table,
                selectedTable.date,
                selectedTable.time
            )
        ) {

            alert("Sorry! This table is no longer available.");

            closeAvailabilityModal();

            return;

        }


        const bookings = getBookings();


        const bookingId = "BK" + Date.now();


        const newBooking = {

            id: bookingId,

            name: name,

            phone: phone,

            date: selectedTable.date,

            time: selectedTable.time,

            guests: selectedTable.guests,

            table: selectedTable.table.id,

            status: "Confirmed"

        };


        bookings.push(newBooking);


        localStorage.setItem(
            "restaurantBookings",
            JSON.stringify(bookings)
        );


        alert(
            `Booking Confirmed!\nBooking ID: ${bookingId}`
        );


        document.getElementById("quickBookingForm").reset();


        closeAvailabilityModal();


        document.getElementById("availabilityForm").requestSubmit();

    });


// GET TODAY'S DATE

function getTodayDate() {

    const today = new Date();

    return today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");

}


// SECURITY

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, character => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"

    })[character]);

}


// FORM EVENT

document.getElementById("availabilityForm")
    .addEventListener("submit", checkAvailability);


// DEFAULT DATE

document.getElementById("bookingDate").min = getTodayDate();

document.getElementById("bookingDate").value = getTodayDate();


lucide.createIcons();