// =====================================
// RESTAURANT BOOKING MANAGEMENT
// =====================================


// 1. LOAD BOOKINGS

let bookings = JSON.parse(
    localStorage.getItem("restaurantBookings")
) || [];


// 2. SAVE BOOKINGS

function saveBookings() {

    localStorage.setItem(
        "restaurantBookings",
        JSON.stringify(bookings)
    );

}


// 3. LOAD RESTAURANT TABLES

function getRestaurantTables() {

    return JSON.parse(
        localStorage.getItem("restaurantTables")
    ) || [];

}


// 4. GENERATE BOOKING CONFIRMATION

function generateBookingConfirmation(booking) {

    let notifications = JSON.parse(
        localStorage.getItem("restaurantNotifications")
    ) || [];


    const notification = {

        id: "NT" + Date.now(),

        type: "confirmation",

        title: "Booking Confirmed!",

        message:
            `Hello ${booking.name}! Your restaurant booking is confirmed.

            Booking ID: ${booking.id}
            Customer: ${booking.name}
            Email: ${booking.email}
            Phone: ${booking.phone}
            Date: ${booking.date}
            Time: ${booking.time}
            Guests: ${booking.guests}
            Table: ${booking.table}

            Thank you for choosing Restro!`,

        createdAt: new Date().toISOString()

    };


    notifications.unshift(notification);


    localStorage.setItem(
        "restaurantNotifications",
        JSON.stringify(notifications)
    );


    alert(
        "Booking Confirmation Generated Successfully!\n\n" +

        "Booking ID: " + booking.id + "\n" +

        "Customer: " + booking.name + "\n" +

        "Email: " + booking.email + "\n\n" +

        "A simulated confirmation email has been generated."
    );

}


// 5. DISPLAY AVAILABLE TABLES

function loadTableOptions(selectedTable = "") {

    const tableSelect = document.getElementById("bookingTable");

    const tables = getRestaurantTables();


    tableSelect.innerHTML =
        '<option value="">Select a table</option>';


    tables.forEach(table => {

        const option = document.createElement("option");

        option.value = table.id;

        option.textContent =
            `${table.id} - ${table.capacity} Seater (${table.status})`;


        if (
            table.status === "Available" ||
            table.id === selectedTable
        ) {

            option.disabled = false;

        } else {

            option.disabled = true;

        }


        if (table.id === selectedTable) {

            option.selected = true;

        }


        tableSelect.appendChild(option);

    });

}


// 6. DISPLAY BOOKINGS

function displayBookings() {

    const body = document.getElementById("bookingBody");

    const search = document.getElementById("searchBooking")
        .value.toLowerCase();

    const filter = document.getElementById("bookingFilter").value;


    const filtered = bookings.filter(booking => {

        const matchesSearch =

            String(booking.id).toLowerCase().includes(search) ||

            String(booking.name).toLowerCase().includes(search);


        const matchesStatus =

            filter === "All" || booking.status === filter;


        return matchesSearch && matchesStatus;

    });


    body.innerHTML = "";


    filtered.forEach(booking => {

        const row = document.createElement("tr");


        const statusClass = {

            "Pending": "booking-pending",

            "Confirmed": "booking-confirmed",

            "Seated": "booking-seated",

            "Cancelled": "booking-cancelled",

            "No-Show": "booking-no-show"

        }[booking.status] || "";


        row.innerHTML = `

            <td>
                <strong>${escapeHTML(booking.id)}</strong>
            </td>

            <td>${escapeHTML(booking.name)}</td>

            <td>${escapeHTML(booking.date)}</td>

            <td>${escapeHTML(booking.time)}</td>

            <td>${booking.guests}</td>

            <td>${escapeHTML(booking.table)}</td>

            <td>

                <span class="booking-status ${statusClass}">
                    ${escapeHTML(booking.status)}
                </span>

            </td>

            <td>

                <div class="action-buttons">

                    <button class="action-btn"
                        onclick="editBooking('${encodeURIComponent(booking.id)}')">

                        <i data-lucide="pencil"></i>

                    </button>


                    <button class="action-btn delete-btn"
                        onclick="deleteBooking('${encodeURIComponent(booking.id)}')">

                        <i data-lucide="trash-2"></i>

                    </button>

                </div>

            </td>

        `;


        body.appendChild(row);

    });


    document.getElementById("emptyBookings").hidden =
        filtered.length !== 0;


    updateBookingStats();


    lucide.createIcons();

}


// 7. UPDATE STATISTICS

function updateBookingStats() {

    document.getElementById("totalBookings").textContent =
        bookings.length;


    document.getElementById("confirmedBookings").textContent =
        bookings.filter(b => b.status === "Confirmed").length;


    document.getElementById("pendingBookings").textContent =
        bookings.filter(b => b.status === "Pending").length;


    document.getElementById("totalGuests").textContent =

        bookings

            .filter(b => !["Cancelled", "No-Show"].includes(b.status))

            .reduce((total, b) => total + Number(b.guests), 0);

}


// 8. OPEN MODAL

function openBookingModal() {

    document.getElementById("bookingForm").reset();

    document.getElementById("editBookingId").value = "";


    document.getElementById("bookingModalTitle").textContent =
        "Create New Booking";


    const dateInput = document.getElementById("bookingDate");

    const today = new Date();


    const localDate = [

        today.getFullYear(),

        String(today.getMonth() + 1).padStart(2, "0"),

        String(today.getDate()).padStart(2, "0")

    ].join("-");


    dateInput.min = localDate;

    dateInput.value = localDate;


    loadTableOptions();


    document.getElementById("bookingModal")
        .classList.add("show");

}


// 9. CLOSE MODAL

function closeBookingModal() {

    document.getElementById("bookingModal")
        .classList.remove("show");

}


// 10. ADD / UPDATE BOOKING

document.getElementById("bookingForm")

    .addEventListener("submit", function(event) {

        event.preventDefault();


        const oldId =
            document.getElementById("editBookingId").value;


        const name =
            document.getElementById("customerName").value.trim();


        const phone =
            document.getElementById("customerPhone").value.trim();


        const email =
            document.getElementById("customerEmail").value.trim();


        const date =
            document.getElementById("bookingDate").value;


        const time =
            document.getElementById("bookingTime").value;


        const guests =
            Number(document.getElementById("guestCount").value);


        const table =
            document.getElementById("bookingTable").value;


        const status =
            document.getElementById("bookingStatus").value;


        if (!table) {

            alert("Please select a table.");

            return;

        }


        // CHECK TABLE CAPACITY

        const tables = getRestaurantTables();

        const selectedTable = tables.find(t => t.id === table);


        if (!selectedTable) {

            alert("Selected table does not exist.");

            return;

        }


        if (guests > Number(selectedTable.capacity)) {

            alert("Selected table does not have enough capacity.");

            return;

        }


        // CHECK TABLE AVAILABILITY

        const conflict = bookings.some(booking => {

            return (

                booking.id !== oldId &&

                booking.table === table &&

                booking.date === date &&

                booking.time === time &&

                !["Cancelled", "No-Show"].includes(booking.status)

            );

        });


        if (conflict) {

            alert("This table is already booked at this date and time.");

            return;

        }


        // GENERATE BOOKING ID

        const bookingId = oldId ||

            "BK" + Date.now().toString().slice(-8);


        // CREATE BOOKING OBJECT

        const bookingData = {

            id: bookingId,

            name,

            phone,

            email,

            date,

            time,

            guests,

            table,

            status

        };


        // CHECK PREVIOUS BOOKING STATUS

        const previousBooking = oldId

            ? bookings.find(b => b.id === oldId)

            : null;


        // CHECK NEW CONFIRMATION

        const isNewConfirmation =

            status === "Confirmed" &&

            (!previousBooking || previousBooking.status !== "Confirmed");


        // UPDATE OR ADD

        if (oldId) {

            const index = bookings.findIndex(
                b => b.id === oldId
            );


            if (index !== -1) {

                bookings[index] = bookingData;

            }

        } else {

            bookings.push(bookingData);

        }


        // SAVE BOOKING

        saveBookings();


        // GENERATE CONFIRMATION

        if (isNewConfirmation) {

            generateBookingConfirmation(bookingData);

        }


        displayBookings();

        closeBookingModal();


        if (!isNewConfirmation) {

            alert(

                oldId

                    ? "Booking updated successfully!"

                    : "Booking created successfully!"

            );

        }

    });


// 11. EDIT BOOKING

function editBooking(encodedId) {

    const id = decodeURIComponent(encodedId);

    const booking = bookings.find(b => b.id === id);


    if (!booking) return;


    document.getElementById("editBookingId").value =
        booking.id;


    document.getElementById("customerName").value =
        booking.name;


    document.getElementById("customerPhone").value =
        booking.phone;


    document.getElementById("customerEmail").value =
        booking.email || "";


    document.getElementById("bookingDate").value =
        booking.date;


    document.getElementById("bookingTime").value =
        booking.time;


    document.getElementById("guestCount").value =
        booking.guests;


    document.getElementById("bookingStatus").value =
        booking.status;


    document.getElementById("bookingModalTitle").textContent =
        "Edit Booking";


    loadTableOptions(booking.table);


    document.getElementById("bookingModal")
        .classList.add("show");

}


// 12. DELETE BOOKING

function deleteBooking(encodedId) {

    const id = decodeURIComponent(encodedId);


    const confirmDelete = confirm(
        "Are you sure you want to delete this booking?"
    );


    if (!confirmDelete) return;


    bookings = bookings.filter(b => b.id !== id);


    saveBookings();

    displayBookings();

}


// 13. SEARCH AND FILTER

document.getElementById("searchBooking")

    .addEventListener("input", displayBookings);


document.getElementById("bookingFilter")

    .addEventListener("change", displayBookings);


// 14. ESCAPE HTML

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, character => ({

        "&": "&amp;",

        "<": "&lt;",

        ">": "&gt;",

        '"': "&quot;",

        "'": "&#39;"

    })[character]);

}


// 15. INITIALIZE

displayBookings();