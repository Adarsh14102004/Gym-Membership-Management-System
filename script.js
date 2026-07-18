// Smooth Scroll
// alert("JS Working");
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

document.querySelector(".contact-form").addEventListener("submit", async function(e) {
    e.preventDefault();

    const data = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        message: document.getElementById("message").value
    };

    try {
        const response = await fetch("http://localhost:5000/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        alert(result.message);

        if (result.success) {
            this.reset();
        }

    } catch (error) {
        console.log(error);
        alert("Server Error");
    }
});

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
// const topBtn = document.getElementById("topBtn");

// window.addEventListener("scroll", function() {

//     if (window.scrollY > 300) {
//         topBtn.style.display = "block";
//     } else {
//         topBtn.style.display = "none";
//     }

// });

// topBtn.addEventListener("click", function() {

//     window.scrollTo({
//         top: 0,
//         behavior: "smooth"
//     });

// });
// Show Members
async function loadMembers() {

    try {

        const response = await fetch("http://localhost:5000/members");
        const result = await response.json();

        console.log(result);
        console.log(result.data[0]);

        let table = document.getElementById("membersTable");

        console.log(table); // <-- Aur yaha add karo

        table.innerHTML = "";

        result.data.forEach(member => {

            table.innerHTML += `
                <tr>
                    <td>${member.id}</td>
                    <td>${member.Name}</td>
                    <td>${member.email}</td>
                    <td>${member.phone}</td>
                    <td>${member.membership_plan}</td>
                    <td>${member.joining_date}</td>
                    <td>${member.fees}</td>
                </tr>
            `;

        });

    } catch (error) {
        console.log(error);
    }

}

loadMembers();
console.log("SCRIPT END");