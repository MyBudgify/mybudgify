document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    // Register
    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            let username = document.getElementById("register-username").value;
            let password = document.getElementById("register-password").value;
            let message = document.getElementById("register-message");

            try {
                let response = await fetch("http://localhost:3306/register", { // Ensure the correct port (3000)
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });

                let data = await response.json();
                message.innerText = data.message || data.error;
                message.style.color = response.ok ? "green" : "red";

                if (response.ok) {
                    // If registration is successful, check for cookies and redirect to the dashboard
                    setTimeout(() => window.location.href = "dashboard.html", 1500);
                }
            } catch (error) {
                message.innerText = "Error connecting to server.";
            }
        });
    }

    // Login
    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            let username = document.getElementById("username").value;
            let password = document.getElementById("password").value;
            let message = document.getElementById("login-message");

            try {
                let response = await fetch("http://localhost:3306/login", { // Ensure the correct port (3000)
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });

                let data = await response.json();
                message.innerText = data.message || data.error;
                message.style.color = response.ok ? "green" : "red";

                if (response.ok) {
                    // If login is successful, redirect to the dashboard
                    setTimeout(() => window.location.href = "dashboard.html", 1000);
                }
            } catch (error) {
                message.innerText = "Error connecting to server.";
            }
        });
    }
});
