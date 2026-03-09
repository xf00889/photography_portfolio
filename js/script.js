// Global app behavior
document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const siteHeader = document.getElementById("site-header");
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const navLinks = Array.from(document.querySelectorAll(".nav-link, .mobile-nav-link"));
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
  const photoCards = Array.from(document.querySelectorAll(".photo-card"));
  const floatingTopButton = document.getElementById("back-to-top-floating");
  const footerTopButton = document.getElementById("back-to-top-footer");
  const timeline = document.getElementById("experience-timeline");
  const contactForm = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");

  // Vendor libraries
  if (window.AOS) {
    AOS.init({
      once: true,
      duration: prefersReducedMotion ? 0 : 900,
      easing: "ease-out-cubic",
      offset: 80,
      disable: prefersReducedMotion
    });
  }

  if (window.Swiper) {
    new Swiper(".hero-swiper", {
      effect: "fade",
      loop: true,
      speed: prefersReducedMotion ? 0 : 1400,
      allowTouchMove: true,
      autoplay: prefersReducedMotion
        ? false
        : {
            delay: 4600,
            disableOnInteraction: false
          }
    });
  }

  if (window.GLightbox) {
    GLightbox({
      selector: ".glightbox-art",
      touchNavigation: true,
      loop: true,
      openEffect: prefersReducedMotion ? "none" : "zoom",
      closeEffect: prefersReducedMotion ? "none" : "fade"
    });

    GLightbox({
      selector: ".glightbox-photo",
      touchNavigation: true,
      loop: true,
      openEffect: prefersReducedMotion ? "none" : "zoom",
      closeEffect: prefersReducedMotion ? "none" : "fade"
    });
  }

  // Hero intro and section polish
  if (window.gsap && !prefersReducedMotion) {
    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    gsap.from(".hero-copy", {
      y: 28,
      opacity: 0,
      duration: 1.1,
      ease: "power3.out",
      stagger: 0.12,
      delay: 0.2
    });

    gsap.utils.toArray(".section-title").forEach((title) => {
      if (!window.ScrollTrigger) {
        return;
      }

      gsap.from(title, {
        scrollTrigger: {
          trigger: title,
          start: "top 88%"
        },
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });
    });
  }

  // Navigation state
  const setHeaderState = () => {
    const scrolled = window.scrollY > 40;
    siteHeader.classList.toggle("is-scrolled", scrolled);
    floatingTopButton.classList.toggle("is-visible", window.scrollY > 500);
  };

  const setActiveNav = (id) => {
    navLinks.forEach((link) => {
      const isCurrent = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", isCurrent);
    });
  };

  const closeMobileMenu = () => {
    mobileMenu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    menuToggle.innerHTML = '<i class="ri-menu-3-line"></i>';
  };

  const openMobileMenu = () => {
    mobileMenu.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close navigation");
    menuToggle.innerHTML = '<i class="ri-close-line"></i>';
  };

  menuToggle?.addEventListener("click", (e) => {
    e.preventDefault();
    const isOpen = mobileMenu.classList.contains("is-open");
    
    // Batch DOM updates
    requestAnimationFrame(() => {
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }, { passive: false });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      requestAnimationFrame(() => {
        closeMobileMenu();
      });
    }, { passive: true });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu();
    }
  });

  // Section observers
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveNav(entry.target.id);
        }
      });
    },
    {
      rootMargin: "-35% 0px -45% 0px",
      threshold: 0.1
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  if (timeline) {
    const timelineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            timeline.classList.add("is-visible");
          }
        });
      },
      {
        threshold: 0.25
      }
    );

    timelineObserver.observe(timeline);
  }

  // Photography filter
  const animateVisibleCards = () => {
    if (!window.gsap || prefersReducedMotion) {
      return;
    }

    const visibleCards = photoCards.filter((card) => !card.classList.contains("is-hidden"));
    
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      gsap.fromTo(
        visibleCards,
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.06,
          ease: "power2.out",
          overwrite: true
        }
      );
    });
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      // Prevent default and stop propagation for faster response
      e.preventDefault();
      
      const filter = button.dataset.filter;

      filterButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");

      // Use requestIdleCallback for non-critical work
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          photoCards.forEach((card) => {
            const category = card.dataset.category;
            const shouldShow = filter === "all" || category === filter;
            card.classList.toggle("is-hidden", !shouldShow);
          });
          animateVisibleCards();
        });
      } else {
        photoCards.forEach((card) => {
          const category = card.dataset.category;
          const shouldShow = filter === "all" || category === filter;
          card.classList.toggle("is-hidden", !shouldShow);
        });
        animateVisibleCards();
      }
    }, { passive: false });
  });

  // Parallax motion for tagged elements
  const parallaxElements = Array.from(document.querySelectorAll("[data-parallax]"));

  const updateParallax = () => {
    if (prefersReducedMotion) {
      return;
    }

    const scrollTop = window.scrollY;
    const viewportHeight = window.innerHeight;

    parallaxElements.forEach((element) => {
      const speed = Number.parseFloat(element.dataset.parallax || "0");
      const rect = element.getBoundingClientRect();
      const offset = rect.top + scrollTop - viewportHeight / 2;
      const shift = (scrollTop - offset) * speed * 0.15;
      element.style.setProperty("--parallax-shift", `${shift.toFixed(2)}px`);
    });
  };

  // Back to top interactions
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
  };

  floatingTopButton?.addEventListener("click", scrollToTop);
  footerTopButton?.addEventListener("click", scrollToTop);

  // Contact form mailto fallback for a static site
  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
      formStatus.textContent = "Please complete the form before sending your inquiry.";
      return;
    }

    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    formStatus.textContent = "Opening your default mail app for a direct reply.";
    window.location.href = `mailto:hello@jzanaia.com?subject=${subject}&body=${body}`;
  });

  // Initial render and listeners
  setActiveNav("home");
  setHeaderState();
  updateParallax();
  animateVisibleCards();

  window.addEventListener(
    "scroll",
    () => {
      setHeaderState();
      updateParallax();
    },
    { passive: true }
  );

  window.addEventListener("resize", updateParallax);

  // Endless slider initialization
  const initEndlessSlider = (sliderId) => {
    const slider = document.getElementById(sliderId);
    if (!slider) return;

    const items = Array.from(slider.children);
    
    // Duplicate items multiple times for seamless loop
    const duplicateCount = 3;
    for (let i = 0; i < duplicateCount; i++) {
      items.forEach((item) => {
        const clone = item.cloneNode(true);
        slider.appendChild(clone);
      });
    }
  };

  // Initialize both sliders
  initEndlessSlider("digital-art-slider");
  initEndlessSlider("works-slider");

  // Reviews System with localStorage (Optimized for storage)
  const reviewsKey = "portfolio_reviews";
  const maxReviews = 50; // Limit total reviews to save storage
  const reviewsGrid = document.getElementById("reviews-grid");
  const reviewForm = document.getElementById("review-form");
  const starButtons = Array.from(document.querySelectorAll(".star-btn"));
  const ratingInput = document.getElementById("review-rating");

  // Compress review data to save space
  const compressReview = (review) => ({
    n: review.name.substring(0, 30), // Limit name to 30 chars
    m: review.message.substring(0, 200), // Limit message to 200 chars
    r: review.rating,
    t: review.timestamp
  });

  // Decompress review data
  const decompressReview = (compressed) => ({
    name: compressed.n,
    message: compressed.m,
    rating: compressed.r,
    timestamp: compressed.t
  });

  // Load reviews from localStorage
  const loadReviews = () => {
    try {
      const compressed = JSON.parse(localStorage.getItem(reviewsKey)) || [];
      const reviews = compressed.map(decompressReview).filter(r => r.name && r.message);
      
      if (reviews.length === 0) {
        reviewsGrid.innerHTML = `
          <div class="col-span-full text-center py-12">
            <p class="text-white/50 text-lg">No reviews yet. Be the first to leave a review!</p>
          </div>
        `;
        return;
      }

      reviewsGrid.innerHTML = reviews
        .sort((a, b) => b.timestamp - a.timestamp)
        .map((review) => {
          const initial = (review.name || "?").charAt(0).toUpperCase();
          const stars = "★".repeat(review.rating || 5) + "☆".repeat(5 - (review.rating || 5));
          const date = new Date(review.timestamp).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
          });

          return `
            <div class="review-card" data-aos="fade-up">
              <div class="review-header">
                <div class="review-avatar">${initial}</div>
                <div class="review-info">
                  <h4>${review.name}</h4>
                  <div class="review-stars">${stars}</div>
                </div>
              </div>
              <p class="review-message">${review.message}</p>
              <p class="review-date">${date}</p>
            </div>
          `;
        })
        .join("");

      // Reinitialize AOS for new elements
      if (window.AOS) {
        AOS.refresh();
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
      // Clear corrupted data
      localStorage.removeItem(reviewsKey);
      reviewsGrid.innerHTML = `
        <div class="col-span-full text-center py-12">
          <p class="text-white/50 text-lg">No reviews yet. Be the first to leave a review!</p>
        </div>
      `;
    }
  };

  // Save review to localStorage with optimization
  const saveReview = (review) => {
    let reviews = JSON.parse(localStorage.getItem(reviewsKey)) || [];
    
    // Add new compressed review
    reviews.push(compressReview(review));
    
    // Keep only the most recent reviews if limit exceeded
    if (reviews.length > maxReviews) {
      reviews = reviews
        .map(decompressReview)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, maxReviews)
        .map(compressReview);
    }
    
    localStorage.setItem(reviewsKey, JSON.stringify(reviews));
  };

  // Star rating interaction
  let selectedRating = 5;
  starButtons.forEach((button, index) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      
      selectedRating = index + 1;
      ratingInput.value = selectedRating;
      
      // Batch DOM updates
      requestAnimationFrame(() => {
        starButtons.forEach((btn, i) => {
          const icon = btn.querySelector("i");
          if (i < selectedRating) {
            btn.classList.add("active");
            icon.className = "ri-star-fill text-2xl";
          } else {
            btn.classList.remove("active");
            icon.className = "ri-star-line text-2xl";
          }
        });
      });
    }, { passive: false });
  });

  // Initialize all stars as active (5 stars default)
  starButtons.forEach((btn) => {
    btn.classList.add("active");
    const icon = btn.querySelector("i");
    icon.className = "ri-star-fill text-2xl";
  });

  // Handle form submission
  reviewForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("review-name").value.trim();
    const message = document.getElementById("review-message").value.trim();
    const rating = parseInt(ratingInput.value);

    if (!name || !message || !rating) {
      alert("Please fill in all fields");
      return;
    }

    const review = {
      name,
      message,
      rating,
      timestamp: Date.now()
    };

    saveReview(review);
    loadReviews();
    reviewForm.reset();
    
    // Reset stars to 5
    selectedRating = 5;
    ratingInput.value = 5;
    starButtons.forEach((btn) => {
      btn.classList.add("active");
      const icon = btn.querySelector("i");
      icon.className = "ri-star-fill text-2xl";
    });

    // Scroll to reviews
    reviewsGrid.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Load reviews on page load
  loadReviews();

});
