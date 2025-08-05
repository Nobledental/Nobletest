document.addEventListener("DOMContentLoaded", () => {
// ========== DOCTOR DETAIL TOGGLE ==========
const doctorCards = document.querySelectorAll(".doctor-card");
const doctorDetail = document.getElementById("doctorDetail");
const closeDetail = document.getElementById("closeDetail");

const doctorData = {
  "Dr Dhivakaran R": {
    name: "Dr Dhivakaran R",
    role: "Chief Medical Director of Noble Dental Care",
    experience: "10 years",
    rating: "4.9",
    specialties: "Director of Healthflo (AI driven Health system)",
    patients: "5,000+",
    summary: "Leading innovator in digital dental health systems across India.",
    contributions: "AI-driven healthcare system integration in 350+ hospitals.",
    phone: "8074512305",
    image: "images/doctors/dhivakaran.jpg"
  },
  "Dr Thik Vijay": {
    name: "Dr Thik Vijay",
    role: "Aesthetics & Cosmetologist",
    experience: "11 years",
    rating: "4.8",
    specialties: "Skin, Hair & Dental",
    patients: "3,200+",
    summary: "Expert in non-invasive cosmetic treatments and smile design.",
    contributions: "Advanced aesthetic treatments using laser & PRP.",
    phone: "8074512305",
    image: "images/doctors/thikvijay.jpg"
  },
  "Dr Roger Ronaldo": {
    name: "Dr Roger Ronaldo",
    role: "Oral & Maxillofacial Surgeon",
    experience: "13 years",
    rating: "4.9",
    specialties: "Implantology, Facial Reconstruction",
    patients: "4,500+",
    summary: "Specializes in facial trauma, dental implants, and bone grafts.",
    contributions: "Known for high success rate in complex reconstructions.",
    phone: "8074512305",
    image: "images/doctors/roger.jpg"
  },
  "Dr Deepak": {
    name: "Dr Deepak",
    role: "Orthodontist",
    experience: "10 years",
    rating: "4.7",
    specialties: "Invisalign, Clear Aligners",
    patients: "2,800+",
    summary: "Assistant Professor with focus on digital orthodontics.",
    contributions: "Developer of in-house clear aligner systems.",
    phone: "8074512305",
    image: "images/doctors/deepak.jpg"
  },
  "Dr Manoj Reddy": {
    name: "Dr Manoj Reddy",
    role: "Oral & Maxillofacial Surgeon",
    experience: "13 years",
    rating: "4.8",
    specialties: "Implantologist",
    patients: "3,900+",
    summary: "Performs complex oral surgeries and rehabilitation cases.",
    contributions: "Known for precise implantology and surgical protocols.",
    phone: "8074512305",
    image: "images/doctors/manoj.jpg"
  },
  "Dr Idhaya": {
    name: "Dr Idhaya",
    role: "Director of Healthflo",
    experience: "7 years",
    rating: "4.6",
    specialties: "Health Insurance & AI-Driven Healthcare",
    patients: "4,000+",
    summary: "Streamlining hospital care with advanced AI systems.",
    contributions: "Health insurance system across 350+ hospitals.",
    phone: "8074512305",
    image: "images/doctors/idhaya.jpg"
  }
};

doctorCards.forEach((card) => {
  card.addEventListener("click", () => {
    const name = card.querySelector("h4").textContent.trim();
    const data = doctorData[name];

    if (!data) return;

    // Inject data
    doctorDetail.querySelector(".doctor-name").textContent = data.name;
    doctorDetail.querySelector(".doctor-role").textContent = data.role;
    doctorDetail.querySelector(".doctor-experience").textContent = `Experience: ${data.experience}`;
    doctorDetail.querySelector(".doctor-rating").textContent = `Rating: ${data.rating}`;
    doctorDetail.querySelector(".doctor-patients").textContent = `Patients Treated: ${data.patients}`;
    doctorDetail.querySelector(".doctor-specialties").textContent = `Specialties: ${data.specialties}`;
    doctorDetail.querySelector(".doctor-summary").textContent = data.summary;
    doctorDetail.querySelector(".doctor-contributions").textContent = data.contributions;
    doctorDetail.querySelector("img").src = data.image;
    doctorDetail.querySelector(".call-button").href = `tel:${data.phone}`;

    // Show panel
    doctorDetail.classList.add("active");
  });
});

closeDetail.addEventListener("click", () => {
  doctorDetail.classList.remove("active");
});

  // ========== DOCTOR SEARCH ==========
  const searchInput = document.querySelector("#doctorSearch");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase();
      doctorCards.forEach((card) => {
        const name = card.querySelector("h4").textContent.toLowerCase();
        card.style.display = name.includes(searchTerm) ? "flex" : "none";
      });
    });
  }

  // ========== SEE MORE BUTTON ==========
  const seeMoreBtn = document.querySelector(".see-more");
  if (seeMoreBtn) {
    seeMoreBtn.addEventListener("click", () => {
      const hiddenCards = document.querySelectorAll(".doctor-card.hidden");
      hiddenCards.forEach((card) => {
        card.classList.remove("hidden");
      });
      seeMoreBtn.style.display = "none"; // Hide the button after showing all
    });
  }
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
