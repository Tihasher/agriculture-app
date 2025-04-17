document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("login_email").value.trim();
    const password = document.getElementById("login_password").value;

    try {
        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        sessionStorage.setItem("token", data.token);
        window.location.href = "main.html"; // Redirect to main page
    } catch (error) {
        alert(error.message);
    }
});