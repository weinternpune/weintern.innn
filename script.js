// ===========================
// WEINTERN v4 – Premium JS
// ===========================

// ---- PRELOADER ----
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('preloader')?.classList.add('done');
  }, 1500);
});

// ---- NAV SCROLL ----
const nav = document.getElementById('nav');
let lastY = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 20);
  lastY = y;
}, { passive: true });

// ---- HAMBURGER ----
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});
mobileMenu?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

// ---- SMOOTH SCROLL ----
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const id = this.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - 76,
        behavior: 'smooth'
      });
    }
  });
});

// ---- ACTIVE NAV LINK ----
const sections = document.querySelectorAll('section[id], footer[id]');
const navLinks = document.querySelectorAll('.nav-link');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      active?.classList.add('active');
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => observer.observe(s));

// ---- FEAR ROTATOR ----
const fearItems = document.querySelectorAll('.fear-item');
let fearIdx = 0;
if (fearItems.length) {
  setInterval(() => {
    fearItems[fearIdx].classList.remove('active');
    fearIdx = (fearIdx + 1) % fearItems.length;
    fearItems[fearIdx].classList.add('active');
  }, 3200);
}

// ---- COUNTER ANIMATION ----
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const dur = 2000;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.floor(easeOut(p) * target).toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString();
  };
  requestAnimationFrame(tick);
}
let countersFired = false;
const statsEl = document.querySelector('.hero-stats');
if (statsEl) {
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !countersFired) {
      countersFired = true;
      statsEl.querySelectorAll('.hstat-n').forEach(animateCounter);
    }
  }, { threshold: 0.5 }).observe(statsEl);
}

// ---- SCROLL REVEAL ----
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // stagger cards in same parent
      const parent = entry.target.parentElement;
      const siblings = [...parent.querySelectorAll('.reveal')];
      const idx = siblings.indexOf(entry.target);
      const delay = Math.min(idx * 90, 400);
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ---- TABS ----
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const tab = document.getElementById('tab-' + btn.dataset.tab);
    if (tab) {
      tab.classList.add('active');
      // instantly show reveals inside newly activated tab
      tab.querySelectorAll('.reveal').forEach(el => {
        if (!el.classList.contains('visible')) el.classList.add('visible');
      });
    }
  });
});

// ---- COURSE FILTER ----
const cfBtns = document.querySelectorAll('.cf-btn');
const courseCards = document.querySelectorAll('.course-card');
cfBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    cfBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    courseCards.forEach(card => {
      const show = filter === 'all' || card.dataset.level === filter;
      card.classList.toggle('hidden', !show);
    });
  });
});

// ---- FORM SUBMIT ----
const toast = document.getElementById('toast');
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4500);
}
// ================= APPLY FORM BACKEND CONNECT =================

document.getElementById('applyForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();

  const formData = {
    name: this.querySelector('input[name="name"]')?.value,
    email: this.querySelector('input[name="email"]')?.value,
    phone: this.querySelector('input[name="phone"]')?.value,
    college: this.querySelector('input[name="college"]')?.value,
    interest: this.querySelector('select[name="interest"]')?.value,
year: this.querySelector('select[name="year"]')?.value,
    message: this.querySelector('textarea[name="message"]')?.value
  };

  await fetch("http://localhost:5000/apply-form", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formData)
  });

  showToast("✅ Application sent successfully!");
  this.reset();
});


// ================= HIRE FORM BACKEND CONNECT =================

document.getElementById('hireForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();

  const services = Array.from(
    this.querySelectorAll('input[name="services"]:checked')
  ).map(el => el.value).join(", ");

  const formData = {
    name: this.querySelector('input[name="name"]').value,
    company: this.querySelector('input[name="company"]').value,
    email: this.querySelector('input[name="email"]').value,
    phone: this.querySelector('input[name="phone"]').value,
    services: services,
    description: this.querySelector('textarea[name="description"]').value,
    budget: this.querySelector('select[name="budget"]').value
  };

  console.log("Hire Data:", formData);

  await fetch("http://localhost:5000/hire-form", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formData)
  });

  alert("Inquiry Sent Successfully!");
  this.reset();
});

// ---- VISION PARTICLES ----
function createParticles() {
  const container = document.getElementById('visionParticles');
  if (!container) return;
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 4 + 2;
    const isGold = Math.random() > 0.5;
    Object.assign(p.style, {
      position: 'absolute',
      width: size + 'px',
      height: size + 'px',
      borderRadius: '50%',
      background: isGold ? 'rgba(232,168,32,0.4)' : 'rgba(33,150,201,0.3)',
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
      animation: `particleFloat ${6 + Math.random() * 8}s ease-in-out ${Math.random() * 4}s infinite`,
    });
    container.appendChild(p);
  }
  const style = document.createElement('style');
  style.textContent = `
    @keyframes particleFloat {
      0%,100% { transform: translateY(0px) scale(1); opacity: 0.4; }
      50% { transform: translateY(-30px) scale(1.2); opacity: 0.8; }
    }
  `;
  document.head.appendChild(style);
}
createParticles();

// ---- ECOSYSTEM NODE PULSE ----
const ecoNodes = document.querySelectorAll('.eco-node');
let ecoIdx = 0;
if (ecoNodes.length) {
  setInterval(() => {
    ecoNodes.forEach(n => { n.style.borderColor = ''; n.style.color = ''; n.style.background = ''; });
    ecoNodes[ecoIdx].style.borderColor = '#E8A820';
    ecoNodes[ecoIdx].style.color = '#1B2A4A';
    ecoNodes[ecoIdx].style.background = '#E8A820';
    ecoIdx = (ecoIdx + 1) % ecoNodes.length;
  }, 900);
}

// ---- CARD HOVER TILT ----
document.querySelectorAll('.course-card, .service-card, .testi-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -6;
    card.style.transform = `translateY(-6px) rotateX(${y}deg) rotateY(${x}deg)`;
    card.style.transformOrigin = 'center center';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transformOrigin = '';
  });
});

console.log('%c🌱 WeIntern v4', 'color:#E8A820;font-size:20px;font-weight:900;font-family:serif');
console.log('%cWhere Students Don\'t Wait for Opportunity. They Build It.', 'color:#2196C9;font-size:12px');

// ================= ENROLL SYSTEM (EMAIL ONLY - DEMO MODE) =================

let selectedCourse = "";
let selectedAmount = "";

// Create Modal
const modalHTML = `
<div id="enrollModal" class="modal-overlay" style="display:none;">
  <div class="modal-box">
    <h3>Course Enrollment</h3>

    <form id="courseEnrollForm">

      <input type="text" id="name" placeholder="Full Name" required><br><br>

      <input type="email" id="email" placeholder="Email" required><br><br>

      <input type="text" id="phone" placeholder="Phone Number" required><br><br>

      <input type="text" id="college" placeholder="College Name" required><br><br>

      <select id="degree" required>
        <option value="">Select Degree</option>
        <option>BCA</option>
        <option>MCA</option>
        <option>B.Tech</option>
        <option>M.Tech</option>
        <option>BSc</option>
        <option>Other</option>
      </select><br><br>

      <select id="year" required>
        <option value="">Select Current Year</option>
        <option>1st Year</option>
        <option>2nd Year</option>
        <option>3rd Year</option>
        <option>Final Year</option>
      </select><br><br>

      <button type="submit">Submit Enrollment</button>
      <button type="button" id="closeModalBtn">Cancel</button>

    </form>
  </div>
</div>
`;

document.body.insertAdjacentHTML("beforeend", modalHTML);

const modal = document.getElementById("enrollModal");

document.getElementById("closeModalBtn").onclick =
() => modal.style.display = "none";


// Detect Enroll button
document.querySelectorAll("#courses .btn-primary").forEach(btn => {

  if (btn.textContent.includes("Enroll")) {

    btn.addEventListener("click", function(e) {

      e.preventDefault();

      const card = this.closest(".course-card");

      selectedCourse =
        card.querySelector("h3").innerText;

      selectedAmount =
        card.querySelector("strong")
        .innerText.replace("₹","");

      modal.style.display = "flex";

    });

  }

});


// Submit enrollment form
document
.getElementById("courseEnrollForm")
.addEventListener("submit", async function(e) {

  e.preventDefault();

  const btn =
    this.querySelector("button[type='submit']");

  btn.innerText = "Submitting...";
  btn.disabled = true;


  const formData = {

    name:
      document.getElementById("name").value,

    email:
      document.getElementById("email").value,

    phone:
      document.getElementById("phone").value,

    college:
      document.getElementById("college").value,

    degree:
      document.getElementById("degree").value,

    year:
      document.getElementById("year").value,

    course:
      selectedCourse,

    amount:
      selectedAmount

  };


  await fetch(
    "http://localhost:5000/enroll-form",
    {

      method: "POST",

      headers: {
        "Content-Type":
        "application/json"
      },

      body:
      JSON.stringify(formData)

    }

  );


  alert(
    "Enrollment submitted successfully!"
  );

  modal.style.display = "none";

  this.reset();

  btn.disabled = false;
  btn.innerText =
  "Submit Enrollment";

});