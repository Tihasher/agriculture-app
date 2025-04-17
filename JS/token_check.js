// Authentication check
document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("token");

    // Redirect to login if no token is found
    if (!token) {
        window.location.href = "index.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/profile", {
            method: "GET",
            headers: { Authorization: token }, // Send token for authentication
        });

        if (!response.ok) {
            throw new Error("Invalid token or session expired");
        }
    } catch (error) {
        alert(error.message);
        sessionStorage.removeItem("token");
        window.location.href = "index.html"; // Redirect to login if token is invalid
    }
});