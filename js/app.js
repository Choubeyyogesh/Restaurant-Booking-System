// Display current date

const dateElement = document.getElementById("currentDate");

const today = new Date();

dateElement.textContent = today.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
});