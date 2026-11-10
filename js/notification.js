// Get notifications from localStorage
let notifications = JSON.parse(
    localStorage.getItem("restaurantNotifications")
) || [];

// Save notifications
function saveNotifications() {
    localStorage.setItem(
        "restaurantNotifications",
        JSON.stringify(notifications)
    );
}

// Display notifications
function displayNotifications() {

    const list = document.getElementById("notificationList");

    document.getElementById("totalNotifications").textContent =
        notifications.length;

    document.getElementById("confirmationCount").textContent =
        notifications.filter(n => n.type === "confirmation").length;

    const today = new Date().toLocaleDateString();

    document.getElementById("todayNotifications").textContent =
        notifications.filter(n =>
            new Date(n.createdAt).toLocaleDateString() === today
        ).length;

    if (notifications.length === 0) {
        list.innerHTML = `
            <div class="empty-message">
                <i data-lucide="bell-off"></i>
                <p>No notifications available.</p>
            </div>
        `;

        lucide.createIcons();
        return;
    }

    list.innerHTML = notifications.map(notification => `
        <div class="notification-card">

            <div class="notification-icon">
                <i data-lucide="mail-check"></i>
            </div>

            <div class="notification-details">

                <h4>${notification.title}</h4>

                <p>${notification.message}</p>

                <div class="notification-meta">

                    <span class="notification-badge">
                        ${notification.type}
                    </span>

                    <span class="notification-time">
                        ${new Date(notification.createdAt).toLocaleString()}
                    </span>

                </div>

            </div>

            <button class="notification-delete"
                onclick="deleteNotification('${notification.id}')">
                <i data-lucide="trash-2"></i>
            </button>

        </div>
    `).join("");

    lucide.createIcons();
}

// Delete single notification
function deleteNotification(id) {

    notifications = notifications.filter(n => n.id !== id);

    saveNotifications();
    displayNotifications();
}

// Clear all notifications
document.getElementById("clearNotifications")
    .addEventListener("click", function () {

        if (confirm("Are you sure you want to clear all notifications?")) {
            notifications = [];
            saveNotifications();
            displayNotifications();
        }

    });

// Initial display
displayNotifications();