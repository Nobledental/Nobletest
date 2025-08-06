// Place this after your DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Your doctor data object. Place at the top or import from another file if needed.
const doctorData = {
  "Dr. Dhivakaran R": {
    name: "Dr. Dhivakaran R",
    role: "Chief Medical Director",
    experience: "10 years",
    rating: "4.9",
    specialties: "General Dentistry, Diagnostics, Digital Health",
    patients: "5000+",
    summary: "Expert in diagnostics, digital dental care and patient management.",
    contributions: "Founder, 500+ successful treatments",
    phone: "8074512305",
    image: "images/doctors/dhivakaran.jpg"
  },
  "Dr. Thik Vijay": {
    name: "Dr. Thik Vijay",
    role: "Aesthetic Cosmetologist",
    experience: "11 years",
    rating: "4.8",
    specialties: "Cosmetology, Smile Design",
    patients: "3200+",
    summary: "Focused on facial aesthetics and smile makeovers.",
    contributions: "400+ aesthetic treatments",
    phone: "8074512305",
    image: "images/doctors/thikvijay.jpg"
  },
  "Dr. Roger Ronaldo": {
    name: "Dr. Roger Ronaldo",
    role: "Maxillofacial Surgeon",
    experience: "13 years",
    rating: "4.9",
    specialties: "Maxillofacial Surgery, Implants",
    patients: "4500+",
    summary: "Specialist in facial trauma & implants.",
    contributions: "350+ successful reconstructions",
    phone: "8074512305",
    image: "images/doctors/roger.jpg"
  },
  "Dr. Deepak": {
    name: "Dr. Deepak",
    role: "Orthodontist",
    experience: "10 years",
    rating: "4.7",
    specialties: "Orthodontics, Aligners",
    patients: "2800+",
    summary: "Digital orthodontics expert.",
    contributions: "Developed in-house aligner system",
    phone: "8074512305",
    image: "images/doctors/deepak.jpg"
  },
  "Dr. Manoj Reddy": {
    name: "Dr. Manoj Reddy",
    role: "Implantologist",
    experience: "13 years",
    rating: "4.8",
    specialties: "Implantology, Surgery",
    patients: "3900+",
    summary: "Complex rehabilitation and implants.",
    contributions: "Precise implant protocols",
    phone: "8074512305",
    image: "images/doctors/manoj.jpg"
  },
  "Dr. Idhaya": {
    name: "Dr. Idhaya",
    role: "Health Insurance Expert",
    experience: "7 years",
    rating: "4.6",
    specialties: "Insurance, AI Healthcare",
    patients: "4000+",
    summary: "Hospital care with AI health insurance.",
    contributions: "Health insurance in 350+ hospitals",
    phone: "8074512305",
    image: "images/doctors/idhaya.jpg"
  }
};

  // Always select the existing glass card by its id/class (should exist in your HTML)
  const detailCard = document.getElementById('doctorDetailCard');
  const closeBtn = document.getElementById('closeDetailBtn');

  // Click any doctor card to show details
  document.querySelectorAll(".doctor-card").forEach(card => {
    card.addEventListener("click", function () {
      const name = card.querySelector("h4").textContent.trim();
      const data = doctorData[name];
      if (!data) return;

      // Update all detail fields
      document.getElementById("docImage").src = data.image;
      document.getElementById("docName").textContent = data.name;
      document.getElementById("docRole").textContent = data.role + ", " + data.experience;
      document.getElementById("docRating").textContent = `★ ${data.rating}`;
      document.getElementById("docPatients").textContent = data.patients;
      document.getElementById("docExp").textContent = data.experience;
      document.getElementById("docAchiev").textContent = "🏅";
      document.getElementById("docSummary").textContent = data.summary;
      document.getElementById("docCallBtn").href = "tel:" + data.phone;

      // Show the detail card
      detailCard.style.display = "flex";
    });
  });

  // Close the card
  closeBtn.addEventListener("click", () => {
    detailCard.style.display = "none";
  });
});

  // ========= NAVIGATION TOGGLE =========
  const menuIcon = document.querySelector(".menu-icon");
  const navLinks = document.querySelector(".nav-links");
  const closeIcon = document.querySelector(".close-icon");

  if (menuIcon && navLinks) {
    menuIcon.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }

  if (closeIcon && navLinks) {
    closeIcon.addEventListener("click", () => {
      navLinks.classList.remove("active");
    });
  }

  // ========= TREATMENT FILTERING FUNCTION =========
  const searchInput = document.getElementById("treatmentSearch");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const query = this.value.toLowerCase();
      const cards = document.querySelectorAll(".service-card");

      cards.forEach((card) => {
        const keywords = card.dataset.keywords?.toLowerCase() || "";
        card.style.display = keywords.includes(query) ? "block" : "none";
      });
    });
  }

  // ========= ANIMATE ON SCROLL =========
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // animate only once
        }
      });
    },
    { threshold: 0.1 }
  );

  const animatedElements = document.querySelectorAll(".animate-on-scroll");
  animatedElements.forEach((el) => observer.observe(el));

  // ========= READ MORE BUTTON LOGIC =========
  const serviceCards = document.querySelectorAll(".service-card");
  serviceCards.forEach((card) => {
    const button = card.querySelector(".read-more-button");
    const url = card.dataset.url;
    if (button && url) {
      button.setAttribute("href", url);
    }
  });

  // ========= SMOOTH SCROLL FOR NAV LINKS =========
  const scrollLinks = document.querySelectorAll('a[href^="#"]');
  scrollLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // ========= DISABLE RIGHT CLICK / COPY =========
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  document.addEventListener("keydown", (e) => {
    if (
      (e.ctrlKey || e.metaKey) &&
      ["a", "c", "x", "v", "s", "p"].includes(e.key.toLowerCase())
    ) {
      e.preventDefault();
    }
  });

  document.addEventListener("copy", (e) => e.preventDefault());
});
