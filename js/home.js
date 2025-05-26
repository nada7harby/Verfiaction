// Loading screen logic
window.addEventListener("load", () => {
  setTimeout(() => {
    const loadingScreen = document.getElementById("loading-screen");
    loadingScreen.style.opacity = "0";
    setTimeout(() => (loadingScreen.style.display = "none"), 600);
  }, 2500);
});

// Navbar mobile toggle
const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

menuBtn.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");
});

// Hero slider logic
const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".slider-dots button");
let currentSlide = 0;
let slideInterval;

function showSlide(index) {
  slides.forEach((slide, i) => {
    if (i === index) {
      slide.classList.add("active");
      dots[i].classList.add("active");
    } else {
      slide.classList.remove("active");
      dots[i].classList.remove("active");
    }
  });
  currentSlide = index;
}

function nextSlide() {
  let next = (currentSlide + 1) % slides.length;
  showSlide(next);
}

function prevSlide() {
  let prev = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(prev);
}

document.getElementById("nextBtn").addEventListener("click", () => {
  nextSlide();
  resetInterval();
});

document.getElementById("prevBtn").addEventListener("click", () => {
  prevSlide();
  resetInterval();
});

dots.forEach((dot, idx) => {
  dot.addEventListener("click", () => {
    showSlide(idx);
    resetInterval();
  });
});

function startInterval() {
  slideInterval = setInterval(nextSlide, 5000);
}
function resetInterval() {
  clearInterval(slideInterval);
  startInterval();
}

startInterval();

// Scroll animations (IntersectionObserver)
const observerOptions = {
  threshold: 0.2,
};
const timelineCards = document.querySelectorAll(".timeline-card");
const planCards = document.querySelectorAll(".plan-card");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, observerOptions);

timelineCards.forEach((card) => observer.observe(card));
planCards.forEach((card) => observer.observe(card));

// Contact form submission handler (basic)
const contactForm = document.getElementById("contact-form");
contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Thank you for contacting SPATRAK! We will get back to you soon.");
  contactForm.reset();
});

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded");

  // Check for token in session storage
  const token = sessionStorage.getItem("authToken");
  const isLoggedIn = !!token;

  // Get dropdown elements
  const avatarDropdownBtn = document.getElementById("avatar-dropdown-btn");
  const avatarDropdownMenu = document.getElementById("avatar-dropdown-menu");
  const mobileUserSection = document.getElementById("mobile-user-section");
  const navToggle = document.getElementById("nav-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  // Function to populate dropdown menu based on login status
  function updateDropdownMenus() {
    // Desktop dropdown
    if (isLoggedIn) {
      avatarDropdownMenu.innerHTML = `
          <a href="Profile.html" class="block px-4 py-2 text-violet-900 hover:bg-violet-50">Profile</a>
          <a href="dashboard.html" class="block px-4 py-2 text-violet-900 hover:bg-violet-50">Dashboard</a>
          <a href="#" id="sign-out-btn" class="block px-4 py-2 text-violet-900 hover:bg-violet-50">Sign out</a>
        `;
    } else {
      avatarDropdownMenu.innerHTML = `
          <a href="login.html" class="block px-4 py-2 text-violet-900 hover:bg-violet-50">Login</a>
          <a href="register.html" class="block px-4 py-2 text-violet-900 hover:bg-violet-50">Register</a>
        `;
    }

    // Mobile menu user section
    if (isLoggedIn) {
      mobileUserSection.innerHTML = `
          <div class="flex items-center gap-2 px-3 py-2">
            <img
              src="images/Sample_User_Icon.png"
              alt="User"
              class="h-8 w-8 rounded-full border-2 border-violet-300 shadow-sm"
            />
            <span class="text-violet-900 font-semibold">User</span>
          </div>
          <a href="Profile.html" class="block px-4 py-2 text-violet-900 hover:bg-violet-50">Profile</a>
          <a href="dashboard.html" class="block px-4 py-2 text-violet-900 hover:bg-violet-50">Dashboard</a>
          <a href="#" id="mobile-sign-out-btn" class="block px-4 py-2 text-violet-900 hover:bg-violet-50">Sign out</a>
        `;
    } else {
      mobileUserSection.innerHTML = `
          <a href="login.html" class="block px-4 py-2 text-violet-900 hover:bg-violet-50">Login</a>
          <a href="register.html" class="block px-4 py-2 text-violet-900 hover:bg-violet-50">Register</a>
        `;
    }

    // Add sign out functionality if logged in
    if (isLoggedIn) {
      const signOutBtn = document.getElementById("sign-out-btn");
      const mobileSignOutBtn = document.getElementById("mobile-sign-out-btn");

      if (signOutBtn) {
        signOutBtn.addEventListener("click", function (e) {
          e.preventDefault();
          sessionStorage.removeItem("authToken");
          window.location.href = "index.html";
        });
      }

      if (mobileSignOutBtn) {
        mobileSignOutBtn.addEventListener("click", function (e) {
          e.preventDefault();
          sessionStorage.removeItem("authToken");
          window.location.href = "index.html";
        });
      }
    }
  }

  // Initialize dropdown menus
  updateDropdownMenus();

  // Toggle dropdown menu on click (for better mobile UX)
  if (avatarDropdownBtn && avatarDropdownMenu) {
    avatarDropdownBtn.addEventListener("click", function () {
      const isVisible = avatarDropdownMenu.classList.contains("opacity-100");

      if (isVisible) {
        avatarDropdownMenu.classList.remove("opacity-100", "visible");
        avatarDropdownMenu.classList.add("opacity-0", "invisible");
      } else {
        avatarDropdownMenu.classList.remove("opacity-0", "invisible");
        avatarDropdownMenu.classList.add("opacity-100", "visible");
      }
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (
      avatarDropdownMenu &&
      avatarDropdownBtn &&
      !avatarDropdownMenu.contains(e.target) &&
      !avatarDropdownBtn.contains(e.target)
    ) {
      avatarDropdownMenu.classList.remove("opacity-100", "visible");
      avatarDropdownMenu.classList.add("opacity-0", "invisible");
    }
  });

  // Mobile menu toggle functionality
  if (navToggle && mobileMenu) {
    function toggleMobileMenu() {
      const isHidden = mobileMenu.classList.contains("hidden");

      if (isHidden) {
        mobileMenu.classList.remove("hidden");
        setTimeout(() => {
          mobileMenu.style.opacity = "1";
          mobileMenu.style.maxHeight = mobileMenu.scrollHeight + "px";
        }, 10);

        navToggle.innerHTML = `
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>`;
      } else {
        mobileMenu.style.opacity = "0";
        mobileMenu.style.maxHeight = "0";
        setTimeout(() => {
          mobileMenu.classList.add("hidden");
        }, 300);

        navToggle.innerHTML = `
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>`;
      }
    }

    navToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();
      toggleMobileMenu();
    });
  }
});
