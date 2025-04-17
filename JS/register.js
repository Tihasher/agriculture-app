document.getElementById("registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const firstName = document.getElementById("first_name").value.trim();
    const lastName = document.getElementById("last_name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:5000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        // Store the new token
        sessionStorage.setItem("token", data.token);

        window.location.href = "main.html"; // Redirect after successful registration
    } catch (error) {
        alert(error.message);
    }
});