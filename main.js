document.addEventListener("DOMContentLoaded", () => {
  const doctorCards = document.querySelectorAll(".doctor-card");
  const overlay = document.createElement("div");
  overlay.classList.add("doctor-overlay");
  document.body.appendChild(overlay);

  const detailCard = document.createElement("div");
  detailCard.classList.add("doctor-detail-card");
  detailCard.innerHTML = 
    <button class="close-btn">&times;</button>
    <img src="" alt="Doctor Image" id="docImage">
    <h3 id="docName" class="detail-item"></h3>
    <p id="docPatients" class="detail-item"></p>
    <p id="docExperience" class="detail-item"></p>
    <p id="docRating" class="detail-item"></p>
    <p id="docSpecialities" class="detail-item"></p>
    <p id="docSummary" class="detail-item"></p>
    <p id="docContributions" class="detail-item"></p>
    <a href="tel:8074512305" class="call-button detail-item">📞 Call Doctor</a>
  ;
  document.body.appendChild(detailCard);

  const closeBtn = detailCard.querySelector(".close-btn");

  // Open detail card
  doctorCards.forEach(card => {
    card.addEventListener("click", () => {
      const name = card.querySelector("h4").textContent.trim();
      const data = doctorData[name];
      if (!data) return;

      // Populate
      detailCard.querySelector("#docImage").src = data.image;
      detailCard.querySelector("#docName").textContent = data.name;
      detailCard.querySelector("#docPatients").textContent = Patients Treated: ${data.patients};
      detailCard.querySelector("#docExperience").textContent = Experience: ${data.experience};
      detailCard.querySelector("#docRating").textContent = Rating: ${data.rating} ⭐;
      detailCard.querySelector("#docSpecialities").textContent = Specialities: ${data.specialties};
      detailCard.querySelector("#docSummary").textContent = Summary: ${data.summary};
      detailCard.querySelector("#docContributions").textContent = Contributions: ${data.contributions};

      // Show
      overlay.classList.add("active");
      detailCard.classList.add("active");
    });
  });

  // Close actions
  function closeCard() {
    overlay.classList.remove("active");
    detailCard.classList.remove("active");
  }

  closeBtn.addEventListener("click", closeCard);
  overlay.addEventListener("click", closeCard);
});

  // ========= TESTIMONIAL SLIDES =========
  const slides = document.querySelectorAll(".testimonial-slide");
  let currentIndex = 0;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.remove("active", "prev", "next");
      if (i === index) {
        slide.classList.add("active");
      } else if (i === (index + 1) % slides.length) {
        slide.classList.add("next");
      } else if (i === (index - 1 + slides.length) % slides.length) {
        slide.classList.add("prev");
      }
    });
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
  }

  if (slides.length > 0) {
    showSlide(currentIndex);
    setInterval(nextSlide, 5000); // every 5 seconds
  }

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

<script>
  function showDoctorDetail(id) {
    document.getElementById(id).classList.remove('hidden');
  }

  function hideDoctorDetail(id) {
    document.getElementById(id).classList.add('hidden');
  }
</script>
