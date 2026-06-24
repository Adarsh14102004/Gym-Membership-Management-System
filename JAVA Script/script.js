// Smooth Scroll
alert("JS Working");
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

document.querySelector(".contact-form").addEventListener("submit", function(e) {
    e.preventDefault();

    let name = document.getElementById("name").value;

    alert("Thank You " + name + "! Your message has been submitted.");

    this.reset();
});