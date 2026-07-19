// Smooth Scroll (Page ko smoothly scroll karne ke liye)
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

// Active Navbar Link (Current section ka navbar active dikhane ke liye)
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

// Counter Animation (Numbers ko animation ke sath show karne ke liye)
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

// Form Submit (Form ka data backend ko bhejne ke liye)
document.querySelector(".contact-form").addEventListener("submit", async function(e) {

    // Page reload hone se rokta hai
    e.preventDefault();

    // Form ka data object me store karna
    const data = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        membership_plan: document.getElementById("plan").value,
        joining_date: document.getElementById("joiningDate").value,
        fees: document.getElementById("fees").value,
        message: document.getElementById("message").value
    };

    try {

        // Backend API ko data bhejna
        const response = await fetch("http://localhost:5000/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        // Backend se response lena
        const result = await response.json();

        alert(result.message);

        // Data save hone par form reset hoga
        if (result.success) {
            this.reset();
        }

    } catch (error) {

        // Error handle karna
        console.log(error);
        alert("Server Error");
    }
});

// Loading Screen
window.addEventListener("load", function() {

    const loader = document.getElementById("loader");

    setTimeout(function() {

        loader.style.opacity = "0";
        loader.style.transition = "opacity 0.8s ease";

        setTimeout(function() {
            loader.style.display = "none";
        }, 800);

    }, 2000);

});

// Members ka data backend se laane aur table me dikhane ke liye
async function loadMembers() {

    try {

        // Backend se members data fetch karna
        const response = await fetch("http://localhost:5000/members");
        const result = await response.json();

        let table = document.getElementById("membersTable");

        // Table ko clear karna
        table.innerHTML = "";

        // Har member ka data table me add karna
        result.data.forEach(member => {

            table.innerHTML += `
                <tr>
                    <td>${member.id}</td>
                    <td>${member.Name}</td>
                    <td>${member.email}</td>
                    <td>${member.phone}</td>
                    <td>${member.membership_plan}</td>
                    <td>${new Date(member.joining_date).toLocaleDateString("en-GB").replace(/\//g, "-")}</td>
                    <td>${member.fees}</td>
                </tr>
            `;

        });

    } catch (error) {
        console.log(error);
    }

}

// Page load hote hi members show honge
loadMembers();

console.log("SCRIPT END");