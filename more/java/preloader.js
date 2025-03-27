document.addEventListener("DOMContentLoaded", () => {
            const preloader = document.getElementById("preloader");
            const progress = document.getElementById("progress");
            const loadingText = document.getElementById("loading-text");
            const loginContainer = document.getElementById("login-container");

            let load = 0;
            const interval = setInterval(() => {
                load += 1;
                progress.style.width = `${load}%`;
                loadingText.textContent = `Loading... ${load}%`;

                if (load >= 100) {
                    clearInterval(interval);
                    preloader.style.opacity = "0";
                    setTimeout(() => {
                        preloader.style.display = "none";
                        loginContainer.style.opacity = "1";
                    }, 500);
                }
            }, 30);
        });
