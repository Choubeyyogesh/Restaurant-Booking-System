// ========================================
// RESTRO CUSTOMER MANAGEMENT
// ========================================


// 1. LOAD CUSTOMER PROFILES

let customers = JSON.parse(
    localStorage.getItem("restaurantCustomers")
) || [];


// 2. LOAD BOOKINGS

function getBookings() {

    return JSON.parse(
        localStorage.getItem("restaurantBookings")
    ) || [];

}


// 3. SAVE CUSTOMERS

function saveCustomers() {

    localStorage.setItem(
        "restaurantCustomers",
        JSON.stringify(customers)
    );

}


// 4. GENERATE CUSTOMER DIRECTORY

function getCustomerDirectory() {

    const bookings = getBookings();

    const directory = [...customers];

    bookings.forEach(booking => {

        const existing = directory.find(customer =>
            customer.phone === booking.phone
        );

        if (!existing) {

            directory.push({

                id: "AUTO-" + booking.phone,

                name: booking.name,

                phone: booking.phone,

                email: "",

                preference: "No Preference",

                occasion: "None"

            });

        }

    });

    return directory;

}


// 5. DISPLAY CUSTOMERS

function displayCustomers() {

    const body = document.getElementById("customerBody");

    const directory = getCustomerDirectory();

    const bookings = getBookings();

    const search = document.getElementById("searchCustomer")
        .value.toLowerCase();

    const filter = document.getElementById("customerFilter")
        .value;


    const filtered = directory.filter(customer => {

        const matchesSearch =
            customer.name.toLowerCase().includes(search) ||
            customer.phone.includes(search) ||
            customer.email.toLowerCase().includes(search);

        const customerBookingCount = bookings.filter(booking =>
            booking.phone === customer.phone &&
            !["Cancelled", "No-Show"].includes(booking.status)
        ).length;

        const customerType =
            customerBookingCount >= 3 ? "VIP" : "Regular";

        const matchesFilter =
            filter === "All" || customerType === filter;

        return matchesSearch && matchesFilter;

    });


    body.innerHTML = "";


    filtered.forEach(customer => {

        const bookingCount = bookings.filter(booking =>
            booking.phone === customer.phone &&
            !["Cancelled", "No-Show"].includes(booking.status)
        ).length;


        const customerType =
            bookingCount >= 3 ? "VIP" : "Regular";


        const row = document.createElement("tr");


        row.innerHTML = `

            <td>
                <div class="customer-name">

                    <div class="customer-avatar">
                        ${escapeHTML(customer.name.charAt(0).toUpperCase())}
                    </div>

                    ${escapeHTML(customer.name)}

                </div>
            </td>

            <td>${escapeHTML(customer.phone)}</td>

            <td>${escapeHTML(customer.email || "Not provided")}</td>

            <td>${bookingCount}</td>

            <td>${escapeHTML(customer.preference)}</td>

            <td>
                <span class="customer-type ${
                    customerType === "VIP"
                    ? "vip-customer"
                    : "regular-customer"
                }">
                    ${customerType}
                </span>
            </td>

            <td>

                <div class="action-buttons">

                    <button class="action-btn"
                        onclick="viewCustomer('${encodeURIComponent(customer.phone)}')"
                        title="View Profile">

                        <i data-lucide="eye"></i>

                    </button>

                    <button class="action-btn"
                        onclick="editCustomer('${encodeURIComponent(customer.phone)}')"
                        title="Edit">

                        <i data-lucide="pencil"></i>

                    </button>

                    <button class="action-btn delete-btn"
                        onclick="deleteCustomer('${encodeURIComponent(customer.phone)}')"
                        title="Delete">

                        <i data-lucide="trash-2"></i>

                    </button>

                </div>

            </td>

        `;


        body.appendChild(row);

    });


    document.getElementById("emptyCustomers").hidden =
        filtered.length !== 0;

    updateCustomerStats();

    lucide.createIcons();

}


// 6. UPDATE STATISTICS

function updateCustomerStats() {

    const directory = getCustomerDirectory();

    const bookings = getBookings();


    document.getElementById("totalCustomers").textContent =
        directory.length;


    document.getElementById("activeCustomers").textContent =
        directory.filter(customer =>
            bookings.some(booking =>
                booking.phone === customer.phone &&
                !["Cancelled", "No-Show"].includes(booking.status)
            )
        ).length;


    document.getElementById("customerBookings").textContent =
        bookings.length;


    document.getElementById("vipCustomers").textContent =
        directory.filter(customer => {

            const count = bookings.filter(booking =>
                booking.phone === customer.phone &&
                !["Cancelled", "No-Show"].includes(booking.status)
            ).length;

            return count >= 3;

        }).length;

}


// 7. OPEN CUSTOMER MODAL

function openCustomerModal() {

    document.getElementById("customerForm").reset();

    document.getElementById("editCustomerId").value = "";

    document.getElementById("customerModalTitle").textContent =
        "Add New Customer";

    document.getElementById("customerMobile").readOnly = false;

    document.getElementById("customerModal")
        .classList.add("show");

}


// 8. CLOSE CUSTOMER MODAL

function closeCustomerModal() {

    document.getElementById("customerModal")
        .classList.remove("show");

}


// 9. ADD / UPDATE CUSTOMER

document.getElementById("customerForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const oldId =
            document.getElementById("editCustomerId").value;

        const name =
            document.getElementById("customerFullName").value.trim();

        const phone =
            document.getElementById("customerMobile").value.trim();

        const email =
            document.getElementById("customerEmail").value.trim();

        const preference =
            document.getElementById("customerPreference").value;

        const occasion =
            document.getElementById("specialOccasion").value;


        // CHECK DUPLICATE PHONE

        const duplicate = getCustomerDirectory().some(customer =>
            customer.phone === phone &&
            customer.phone !== oldId
        );


        if (duplicate) {

            alert("Customer with this phone number already exists!");

            return;

        }


        const customerData = {

            id: oldId || "CUS-" + Date.now(),

            name,
            phone,
            email,
            preference,
            occasion

        };


        if (oldId) {

            const index = customers.findIndex(
                customer => customer.phone === oldId
            );

            if (index !== -1) {

                customers[index] = customerData;

            } else {

                customers.push(customerData);

            }

        } else {

            customers.push(customerData);

        }


        saveCustomers();

        displayCustomers();

        closeCustomerModal();


        alert(oldId
            ? "Customer updated successfully!"
            : "Customer added successfully!"
        );

    });


// 10. EDIT CUSTOMER

function editCustomer(encodedPhone) {

    const phone = decodeURIComponent(encodedPhone);

    const customer = getCustomerDirectory().find(
        customer => customer.phone === phone
    );

    if (!customer) return;


    document.getElementById("editCustomerId").value =
        customer.phone;

    document.getElementById("customerFullName").value =
        customer.name;

    document.getElementById("customerMobile").value =
        customer.phone;

    document.getElementById("customerMobile").readOnly = true;

    document.getElementById("customerEmail").value =
        customer.email || "";

    document.getElementById("customerPreference").value =
        customer.preference || "No Preference";

    document.getElementById("specialOccasion").value =
        customer.occasion || "None";


    document.getElementById("customerModalTitle").textContent =
        "Edit Customer";


    document.getElementById("customerModal")
        .classList.add("show");

}


// 11. DELETE CUSTOMER

function deleteCustomer(encodedPhone) {

    const phone = decodeURIComponent(encodedPhone);

    const hasBookings = getBookings().some(booking =>
        booking.phone === phone
    );

    if (hasBookings) {

        alert(
            "This customer has booking history. " +
            "Their profile cannot be deleted while bookings exist."
        );

        return;

    }


    const confirmDelete = confirm(
        "Are you sure you want to delete this customer?"
    );

    if (!confirmDelete) return;


    customers = customers.filter(
        customer => customer.phone !== phone
    );


    saveCustomers();

    displayCustomers();

}


// 12. VIEW CUSTOMER PROFILE

function viewCustomer(encodedPhone) {

    const phone = decodeURIComponent(encodedPhone);

    const customer = getCustomerDirectory().find(
        customer => customer.phone === phone
    );

    if (!customer) return;


    const bookings = getBookings().filter(booking =>
        booking.phone === phone
    );


    const details = document.getElementById("customerDetails");


    details.innerHTML = `

        <div class="profile-info">

            <h3>${escapeHTML(customer.name)}</h3>

            <p>📞 Phone: ${escapeHTML(customer.phone)}</p>

            <p>✉ Email: ${escapeHTML(customer.email || "Not provided")}</p>

            <p>⭐ Preference: ${escapeHTML(customer.preference)}</p>

            <p>🎉 Occasion: ${escapeHTML(customer.occasion || "None")}</p>

            <p>📋 Total Bookings: ${bookings.length}</p>

        </div>

        <div class="profile-bookings">

            <h4>Booking History</h4>

            ${
                bookings.length === 0
                ? "<p>No booking history available.</p>"
                : bookings.map(booking => `

                    <p>
                        ${escapeHTML(booking.date)}
                        | ${escapeHTML(booking.time)}
                        | ${escapeHTML(booking.table)}
                        | ${escapeHTML(booking.status)}
                    </p>

                `).join("")
            }

        </div>

    `;


    document.getElementById("detailsModal")
        .classList.add("show");

}


// 13. CLOSE DETAILS MODAL

function closeDetailsModal() {

    document.getElementById("detailsModal")
        .classList.remove("show");

}


// 14. SEARCH AND FILTER

document.getElementById("searchCustomer")
    .addEventListener("input", displayCustomers);

document.getElementById("customerFilter")
    .addEventListener("change", displayCustomers);


// 15. ESCAPE HTML

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, character => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"

    })[character]);

}


// 16. INITIALIZE

displayCustomers();