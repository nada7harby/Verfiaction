
    // Loading screen logic
    window.addEventListener('load', () => {
      setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => loadingScreen.style.display = 'none', 600);
      }, 2500);
    });

    // Navbar mobile toggle
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    // Hero slider logic
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.slider-dots button');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
      slides.forEach((slide, i) => {
        if(i === index) {
          slide.classList.add('active');
          dots[i].classList.add('active');
        } else {
          slide.classList.remove('active');
          dots[i].classList.remove('active');
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

    document.getElementById('nextBtn').addEventListener('click', () => {
      nextSlide();
      resetInterval();
    });

    document.getElementById('prevBtn').addEventListener('click', () => {
      prevSlide();
      resetInterval();
    });

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
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
      threshold: 0.2
    };
    const timelineCards = document.querySelectorAll('.timeline-card');
    const planCards = document.querySelectorAll('.plan-card');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    timelineCards.forEach(card => observer.observe(card));
    planCards.forEach(card => observer.observe(card));

    // Contact form submission handler (basic)
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      alert('Thank you for contacting SPATRAK! We will get back to you soon.');
      contactForm.reset();
    });
 
    