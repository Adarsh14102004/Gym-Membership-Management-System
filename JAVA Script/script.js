// Smooth Scroll
document.querySelector(".contact-form");
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();

        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});



// Active Navbar Link
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
    let current = "";

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.clientHeight;

        if (pageYOffset >= sectionTop) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach(link => {
        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {
            link.classList.add("active");
        }
    });
});

// Counter Animation
const counters = document.querySelectorAll(".stat-card strong");

const runCounter = () => {
    counters.forEach(counter => {
        const text = counter.innerText.replace(/[^0-9]/g, '');

        if (!text) return;

        const target = Number(text);
        let count = 0;

        const update = () => {
            const increment = target / 100;

            if (count < target) {
                count += increment;
                counter.innerText = Math.ceil(count);
                requestAnimationFrame(update);
            } else {
                counter.innerText = target;
            }
        };

        update();
    });
};

window.addEventListener("load", runCounter);

// LOADING SCREEN
window.addEventListener("load", function() {

    const loader = document.getElementById("loader");

    // Website 2 second tak loading screen dikhayegi
    setTimeout(function() {

        loader.style.opacity = "0";
        loader.style.transition = "opacity 0.8s ease";

        // Fade hone ke baad loader remove
        setTimeout(function() {
            loader.style.display = "none";
        }, 800);

    }, 2000);

});

// BACK TO TOP BUTTON
const topBtn = document.getElementById("topBtn");

window.addEventListener("scroll", function() {

    if (window.scrollY > 300) {
        topBtn.style.display = "block";
    } else {
        topBtn.style.display = "none";
    }

});

topBtn.addEventListener("click", function() {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
        const role = document.getElementById("loginRole").value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            alert('Login Successful!');
            window.location.href = role === 'admin' ? 'admin-dashboard.html' : 'member-dashboard.html';
        } catch (error) {
            alert(error.message);
        }
    });
}

const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const body = {
            full_name: document.getElementById('registerName').value,
            email: document.getElementById('registerEmail').value,
            phone: document.getElementById('registerPhone').value,
            password: document.getElementById('registerPassword').value
        };

        try {
            const response = await fetch('/api/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            alert('Registration successful! Please login.');
            window.location.href = 'login.html';
        } catch (error) {
            alert(error.message);
        }
    });
}

const contactFormPage = document.getElementById('contactForm');

if (contactFormPage) {
    contactFormPage.addEventListener('submit', async function(e) {
        e.preventDefault();

        const body = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            message: document.getElementById('message').value
        };

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Message could not be sent');
            }

            alert('Thank you! Your message has been saved.');
            this.reset();
        } catch (error) {
            alert(error.message);
        }
    });
}