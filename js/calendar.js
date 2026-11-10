// =====================================
// RESTRO BOOKING CALENDAR
// =====================================


// 1. LOAD BOOKINGS

function getCalendarBookings() {

    return JSON.parse(
        localStorage.getItem("restaurantBookings")
    ) || [];

}


// 2. CURRENT DATE

let currentDate = new Date();

let selectedDate = getDateString(new Date());


// 3. FORMAT DATE

function getDateString(date) {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


// 4. DISPLAY CALENDAR

function renderCalendar() {

    const year = currentDate.getFullYear();

    const month = currentDate.getMonth();

    const bookings = getCalendarBookings();


    const monthName = currentDate.toLocaleString(
        "en-US",
        {
            month: "long",
            year: "numeric"
        }
    );


    document.getElementById("calendarMonth")
        .textContent = monthName;


    const firstDay = new Date(year, month, 1);

    const lastDay = new Date(year, month + 1, 0);


    // Monday = 0, Sunday = 6

    let startingDay = (firstDay.getDay() + 6) % 7;

    const totalDays = lastDay.getDate();


    const calendarDays =
        document.getElementById("calendarDays");


    calendarDays.innerHTML = "";


    // PREVIOUS MONTH DAYS

    const previousMonthLastDay =
        new Date(year, month, 0).getDate();


    for (let i = startingDay - 1; i >= 0; i--) {

        const day =
            previousMonthLastDay - i;

        const date = new Date(year, month - 1, day);

        createCalendarDay(date, true, bookings);

    }


    // CURRENT MONTH DAYS

    for (let day = 1; day <= totalDays; day++) {

        const date = new Date(year, month, day);

        createCalendarDay(date, false, bookings);

    }


    // NEXT MONTH DAYS

    const totalCells =
        Math.ceil(calendarDays.children.length / 7) * 7;


    let nextDay = 1;

    while (calendarDays.children.length < totalCells) {

        const date = new Date(year, month + 1, nextDay);

        createCalendarDay(date, true, bookings);

        nextDay++;

    }


    lucide.createIcons();

}


// 5. CREATE CALENDAR DAY

function createCalendarDay(date, otherMonth, bookings) {

    const calendarDays =
        document.getElementById("calendarDays");


    const dateString = getDateString(date);

    const today = getDateString(new Date());


    const dayBookings = bookings.filter(booking =>
        booking.date === dateString
    );


    const dayElement = document.createElement("div");

    dayElement.className = "calendar-day";


    if (otherMonth) {

        dayElement.classList.add("other-month");

    }


    if (dateString === selectedDate) {

        dayElement.classList.add("selected");

    }


    const dayNumber = document.createElement("div");

    dayNumber.className = "day-number";

    dayNumber.textContent = date.getDate();


    if (dateString === today) {

        dayNumber.classList.add("today-number");

    }


    dayElement.appendChild(dayNumber);


    // DISPLAY BOOKINGS

    dayBookings.slice(0, 3).forEach(booking => {

        const event = document.createElement("div");

        event.className =
            `calendar-event event-${booking.status.toLowerCase().replaceAll(" ", "")}`;

        event.textContent =
            `${booking.time} ${booking.name}`;

        event.title =
            `${booking.name} - ${booking.status}`;

        dayElement.appendChild(event);

    });


    // MORE BOOKINGS INDICATOR

    if (dayBookings.length > 3) {

        const more = document.createElement("div");

        more.className = "more-events";

        more.textContent =
            `+${dayBookings.length - 3} more`;

        dayElement.appendChild(more);

    }


    // CLICK EVENT

    dayElement.addEventListener("click", function() {

        selectedDate = dateString;

        renderCalendar();

        showSelectedDateBookings();

    });


    calendarDays.appendChild(dayElement);

}


// 6. SHOW SELECTED DATE BOOKINGS

function showSelectedDateBookings() {

    const bookings = getCalendarBookings();


    const filtered = bookings
        .filter(booking => booking.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time));


    const tbody =
        document.getElementById("selectedBookings");


    tbody.innerHTML = "";


    const formattedDate = new Date(
        selectedDate + "T00:00:00"
    ).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });


    document.getElementById("selectedDateTitle")
        .textContent = formattedDate + " Reservations";


    document.getElementById("selectedBookingCount")
        .textContent = `${filtered.length} Bookings`;


    filtered.forEach(booking => {

        const row = document.createElement("tr");


        const statusClass = {

            "Confirmed": "booking-confirmed",

            "Pending": "booking-pending",

            "Seated": "booking-seated",

            "Cancelled": "booking-cancelled",

            "No-Show": "booking-no-show"

        }[booking.status] || "";


        row.innerHTML = `

            <td>${escapeHTML(booking.id)}</td>

            <td>${escapeHTML(booking.name)}</td>

            <td>${escapeHTML(booking.time)}</td>

            <td>${Number(booking.guests)}</td>

            <td>${escapeHTML(booking.table)}</td>

            <td>

                <span class="booking-status ${statusClass}">

                    ${escapeHTML(booking.status)}

                </span>

            </td>

        `;


        tbody.appendChild(row);

    });


    document.getElementById("noCalendarBookings").hidden =
        filtered.length !== 0;

}


// 7. UPDATE STATISTICS

function updateCalendarStats() {

    const bookings = getCalendarBookings();


    document.getElementById("calendarTotal")
        .textContent = bookings.length;


    document.getElementById("calendarConfirmed")
        .textContent = bookings.filter(b =>
            b.status === "Confirmed"
        ).length;


    document.getElementById("calendarPending")
        .textContent = bookings.filter(b =>
            b.status === "Pending"
        ).length;


    document.getElementById("calendarGuests")
        .textContent = bookings
            .filter(b => !["Cancelled", "No-Show"].includes(b.status))
            .reduce((total, b) =>
                total + Number(b.guests), 0);

}


// 8. PREVIOUS MONTH

document.getElementById("prevMonth")
    .addEventListener("click", function() {

        currentDate.setMonth(
            currentDate.getMonth() - 1
        );

        renderCalendar();

    });


// 9. NEXT MONTH

document.getElementById("nextMonth")
    .addEventListener("click", function() {

        currentDate.setMonth(
            currentDate.getMonth() + 1
        );

        renderCalendar();

    });


// 10. TODAY BUTTON

document.getElementById("todayBtn")
    .addEventListener("click", function() {

        currentDate = new Date();

        selectedDate = getDateString(new Date());

        renderCalendar();

        showSelectedDateBookings();

    });


// 11. HTML SECURITY

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, character => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"

    })[character]);

}


// 12. INITIALIZE

function initializeCalendar() {

    renderCalendar();

    showSelectedDateBookings();

    updateCalendarStats();

}


initializeCalendar();