// Delete-account function
document.getElementById("delete-account").addEventListener("click", async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;

    try {
        const token = sessionStorage.getItem("token");

        const response = await fetch("http://localhost:5000/delete-account", {
            method: "DELETE",
            headers: { Authorization: token },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        sessionStorage.removeItem("token");
        window.location.href = "index.html"; // Redirect to login
    } catch (error) {
        alert(error.message);
    }
});

// Sign-off function
document.getElementById("sign-off").addEventListener("click", () => {
    sessionStorage.removeItem("token");
    window.location.href = "index.html"; // Redirect to login
});

//
document.addEventListener("DOMContentLoaded", function () {
    let links = document.querySelectorAll(".nav-link");
    links.forEach(link => {
        if (link.href === window.location.href) {
            link.classList.add("active");
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("info-modal");
    const infoBtn = document.getElementById("info-btn");
    const closeBtn = document.querySelector(".close-btn");
    const dots = document.querySelectorAll(".dot");
    const cards = document.querySelectorAll(".info-card");

    let currentIndex = 0;

    function showCard(index) {
        cards.forEach(card => card.classList.remove("active"));
        dots.forEach(dot => dot.classList.remove("active"));

        cards[index].classList.add("active");
        dots[index].classList.add("active");
    }

    dots.forEach(dot => {
        dot.addEventListener("click", function () {
            currentIndex = parseInt(this.dataset.index);
            showCard(currentIndex);
        });
    });

    infoBtn.addEventListener("click", function () {
        modal.style.display = "block";
        showCard(0); // Show first card initially
    });

    closeBtn.addEventListener("click", function () {
        modal.style.display = "none";
    });

    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});

document.getElementById("settings-btn").addEventListener("click", function(event) {
    event.stopPropagation(); // Prevents click from propagating to document
    let dropdown = document.getElementById("settings-dropdown");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
});

// Close dropdown when clicking outside
document.addEventListener("click", function() {
    let dropdown = document.getElementById("settings-dropdown");
    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
    }
});


// Get region select element
const regionSelect = document.getElementById("region-select");

// Load saved region from localStorage, default to Tashkent
const savedRegion = localStorage.getItem("selectedRegion") || "Tashkent";
regionSelect.value = savedRegion;

// Store the selected region when changed
regionSelect.addEventListener("change", function () {
    localStorage.setItem("selectedRegion", this.value);
});

// Get crop select element
const cropSelect = document.getElementById("crop-select");

// Load saved crop from localStorage, default to Cotton
const savedCrop = localStorage.getItem("selectedCrop") || "cotton";
cropSelect.value = savedCrop;

// Store the selected cotton when changed
cropSelect.addEventListener("change", function () {
    localStorage.setItem("selectedCrop", this.value);
});