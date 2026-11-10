// ==================================
// RESTRO REPORTS & ANALYTICS
// ==================================


// GET DATA

function getBookings() {

    return JSON.parse(
        localStorage.getItem("restaurantBookings")
    ) || [];

}


function getTables() {

    return JSON.parse(
        localStorage.getItem("restaurantTables")
    ) || [];

}


// CHART VARIABLES

let revenueChart = null;

let bookingChart = null;


// CURRENCY FORMAT

function formatCurrency(amount) {

    return new Intl.NumberFormat("en-IN", {

        style: "currency",

        currency: "INR",

        maximumFractionDigits: 0

    }).format(amount);

}


// GENERATE REPORTS

function generateReports() {

    const start = document.getElementById("startDate").value;

    const end = document.getElementById("endDate").value;


    if (start && end && start > end) {

        alert("End date cannot be earlier than start date.");

        return;

    }


    const allBookings = getBookings();


    const bookings = allBookings.filter(booking => {

        if (start && booking.date < start) return false;

        if (end && booking.date > end) return false;

        return true;

    });


    updateStatistics(bookings);

    updateCharts(bookings);

    updateBookingTable(bookings);

    updateOccupancy();


}


// UPDATE STATISTICS

function updateStatistics(bookings) {

    const validBookings = bookings.filter(b =>
        !["Cancelled", "No-Show"].includes(b.status)
    );


    const totalGuests = validBookings.reduce(
        (sum, b) => sum + Number(b.guests || 0),
        0
    );


    // Revenue is calculated only when a booking has an actual amount.

    const revenue = validBookings.reduce(
        (sum, b) => sum + Number(b.amount || 0),
        0
    );


    document.getElementById("totalRevenue").textContent =
        formatCurrency(revenue);


    document.getElementById("totalBookings").textContent =
        bookings.length;


    document.getElementById("confirmedBookings").textContent =
        bookings.filter(b => b.status === "Confirmed").length;


    document.getElementById("totalGuests").textContent =
        totalGuests;

}


// MONTHLY REVENUE CHART

function updateCharts(bookings) {

    const monthlyRevenue = {};

    const statuses = {

        Confirmed: 0,

        Pending: 0,

        Seated: 0,

        Cancelled: 0,

        "No-Show": 0

    };


    bookings.forEach(booking => {

        const date = new Date(booking.date + "T00:00:00");

        const month = date.toLocaleString("en-IN", {
            month: "short",
            year: "numeric"
        });


        if (!monthlyRevenue[month]) {

            monthlyRevenue[month] = 0;

        }


        if (!["Cancelled", "No-Show"].includes(booking.status)) {

            monthlyRevenue[month] += Number(booking.amount || 0);

        }


        if (statuses[booking.status] !== undefined) {

            statuses[booking.status]++;

        }

    });


    // REVENUE CHART

    if (revenueChart) {

        revenueChart.destroy();

    }


    revenueChart = new Chart(
        document.getElementById("revenueChart"),
        {

            type: "bar",

            data: {

                labels: Object.keys(monthlyRevenue),

                datasets: [{

                    label: "Revenue (₹)",

                    data: Object.values(monthlyRevenue),

                    backgroundColor: "#8B5CF6",

                    borderRadius: 6

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false

            }

        }
    );


    // BOOKING STATUS CHART

    if (bookingChart) {

        bookingChart.destroy();

    }


    bookingChart = new Chart(
        document.getElementById("bookingChart"),
        {

            type: "doughnut",

            data: {

                labels: Object.keys(statuses),

                datasets: [{

                    data: Object.values(statuses),

                    backgroundColor: [

                        "#16A36A",

                        "#F59E0B",

                        "#8B5CF6",

                        "#EF4444",

                        "#9CA3AF"

                    ]

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false

            }

        }
    );

}


// TABLE OCCUPANCY

function updateOccupancy() {

    const tables = getTables();


    const counts = {

        Available: 0,

        Reserved: 0,

        Occupied: 0,

        "Out of Service": 0

    };


    tables.forEach(table => {

        const status = counts[table.status] !== undefined
            ? table.status
            : "Available";

        counts[status]++;

    });


    document.getElementById("availableCount").textContent =
        counts.Available;


    document.getElementById("reservedCount").textContent =
        counts.Reserved;


    document.getElementById("occupiedCount").textContent =
        counts.Occupied;


    document.getElementById("serviceCount").textContent =
        counts["Out of Service"];

}


// BOOKING REPORT TABLE

function updateBookingTable(bookings) {

    const tbody =
        document.getElementById("reportTableBody");


    tbody.innerHTML = "";


    bookings.forEach(booking => {

        const row = document.createElement("tr");


        row.innerHTML = `

            <td>${escapeHTML(booking.id)}</td>

            <td>${escapeHTML(booking.name)}</td>

            <td>${escapeHTML(booking.date)}</td>

            <td>${escapeHTML(booking.time)}</td>

            <td>${Number(booking.guests || 0)}</td>

            <td>${escapeHTML(booking.table)}</td>

            <td>${escapeHTML(booking.status)}</td>

            <td>${formatCurrency(Number(booking.amount || 0))}</td>

        `;


        tbody.appendChild(row);

    });

}


// EXPORT CSV

function exportCSV() {

    const bookings = getBookings();


    const start = document.getElementById("startDate").value;

    const end = document.getElementById("endDate").value;


    const filtered = bookings.filter(b => {

        if (start && b.date < start) return false;

        if (end && b.date > end) return false;

        return true;

    });


    const headers = [

        "Booking ID",

        "Customer",

        "Date",

        "Time",

        "Guests",

        "Table",

        "Status",

        "Revenue"

    ];


    const rows = filtered.map(b => [

        b.id,

        b.name,

        b.date,

        b.time,

        b.guests,

        b.table,

        b.status,

        b.amount || 0

    ]);


    const csv = [headers, ...rows].map(row =>

        row.map(value =>

            `"${String(value ?? "").replace(/"/g, '""')}"`

        ).join(",")

    ).join("\n");


    const blob = new Blob(

        ["\uFEFF" + csv],

        { type: "text/csv;charset=utf-8;" }

    );


    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "Restro_Booking_Report.csv";

    link.click();


    URL.revokeObjectURL(url);

}


// HTML SECURITY

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, character => ({

        "&": "&amp;",

        "<": "&lt;",

        ">": "&gt;",

        '"': "&quot;",

        "'": "&#39;"

    })[character]);

}


// DEFAULT DATE RANGE

function initializeReports() {

    const today = new Date();

    const firstDay = new Date(

        today.getFullYear(),

        today.getMonth(),

        1

    );


    document.getElementById("startDate").value =
        firstDay.toISOString().split("T")[0];


    document.getElementById("endDate").value =
        today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");


    generateReports();

    lucide.createIcons();

}


initializeReports();