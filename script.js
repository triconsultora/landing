// Modular Theme Management System
const ThemeManager = {
  elements: {
    toggle: null,
    toggleMobile: null,
    icon: null,
    iconMobile: null,
    header: null,
  },

  init() {
    this.cacheElements();
    this.applyInitialTheme();
    this.setupEventListeners();
  },

  cacheElements() {
    this.elements.toggle = document.getElementById("theme-toggle");
    this.elements.toggleMobile = document.getElementById("theme-toggle-mobile");
    this.elements.icon = this.elements.toggle?.querySelector("i");
    this.elements.iconMobile = this.elements.toggleMobile?.querySelector("i");
    this.elements.header = document.querySelector(".header");
  },

  getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  },

  getSavedTheme() {
    return localStorage.getItem("theme");
  },

  getCurrentTheme() {
    return document.documentElement.getAttribute("data-theme");
  },

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    this.updateIcons(theme);
    this.updateHeaderBackground(theme);
  },

  applyInitialTheme() {
    const savedTheme = this.getSavedTheme();
    const initialTheme = savedTheme || this.getSystemTheme();

    document.documentElement.setAttribute("data-theme", initialTheme);
    this.updateIcons(initialTheme);
  },

  updateIcons(theme) {
    const iconClass = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
    const ariaLabel =
      theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro";

    if (this.elements.icon) this.elements.icon.className = iconClass;
    if (this.elements.iconMobile)
      this.elements.iconMobile.className = iconClass;

    // Update ARIA labels and pressed state
    if (this.elements.toggle) {
      this.elements.toggle.setAttribute("aria-label", ariaLabel);
      this.elements.toggle.setAttribute(
        "aria-pressed",
        theme === "dark" ? "true" : "false"
      );
    }
    if (this.elements.toggleMobile) {
      this.elements.toggleMobile.setAttribute("aria-label", ariaLabel);
      this.elements.toggleMobile.setAttribute(
        "aria-pressed",
        theme === "dark" ? "true" : "false"
      );
    }
  },

  updateHeaderBackground(theme) {
    if (!this.elements.header) return;

    const isDark = theme === "dark";
    const isScrolled = window.scrollY > 100;
    const opacity = isScrolled ? 0.98 : 0.95;
    const bgColor = isDark ? "17, 24, 39" : "255, 255, 255";

    this.elements.header.style.background = `rgba(${bgColor}, ${opacity})`;
  },

  toggle() {
    const currentTheme = this.getCurrentTheme();
    const newTheme = currentTheme === "light" ? "dark" : "light";
    this.setTheme(newTheme);
  },

  setupEventListeners() {
    // Toggle button listeners
    if (this.elements.toggle) {
      this.elements.toggle.addEventListener("click", () => this.toggle());
    }
    if (this.elements.toggleMobile) {
      this.elements.toggleMobile.addEventListener("click", () => this.toggle());
    }

    // System theme change listener
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!this.getSavedTheme()) {
          const newTheme = e.matches ? "dark" : "light";
          this.setTheme(newTheme);
        }
      });
  },
};

// Contact Form Management Module
const ContactFormManager = {
  form: null,
  submitBtn: null,
  originalBtnContent: "",

  config: {
    APPS_SCRIPT_URL:
      "https://script.google.com/macros/s/AKfycbyCFYEdsx8uUaGdiTX4BRbb5e3_E7X2sV5k8UoGlMApdMpat3JSZHy93RMy-X9Titf5Ew/exec",
    messageTypes: {
      success: "#10B981",
      error: "#EF4444",
      info: "#3B82F6",
    },
  },

  init() {
    this.form = document.getElementById("contactForm");
    if (this.form) {
      this.submitBtn = this.form.querySelector(".submit-btn");
      this.originalBtnContent = this.submitBtn?.innerHTML || "";
      this.setupEventListeners();
      this.setupValidation();
    }
  },

  setupEventListeners() {
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
  },

  setupValidation() {
    // Add validation on blur for better UX
    const requiredInputs = this.form.querySelectorAll(
      "input[required], textarea[required]"
    );
    requiredInputs.forEach((input) => {
      input.addEventListener("blur", () => this.validateField(input));
      input.addEventListener("input", () => this.clearFieldValidation(input));
    });
  },

  validateField(field) {
    const isValid = field.checkValidity();
    const errorDiv = document.getElementById(
      field.getAttribute("aria-describedby")
    );

    if (!isValid && field.value.trim() !== "") {
      field.classList.add("error");
      field.classList.remove("success");
      if (errorDiv) {
        errorDiv.textContent = field.validationMessage;
        errorDiv.classList.add("show");
      }
    } else if (isValid && field.value.trim() !== "") {
      field.classList.remove("error");
      field.classList.add("success");
      if (errorDiv) {
        errorDiv.classList.remove("show");
      }
    }
  },

  clearFieldValidation(field) {
    field.classList.remove("error", "success");
    const errorDiv = document.getElementById(
      field.getAttribute("aria-describedby")
    );
    if (errorDiv) {
      errorDiv.classList.remove("show");
    }
  },

  handleSubmit(e) {
    e.preventDefault();

    // Add submitted class for CSS validation styling
    this.form.classList.add("form-submitted");

    // Validate all required fields
    const requiredInputs = this.form.querySelectorAll(
      "input[required], textarea[required]"
    );
    let isFormValid = true;

    requiredInputs.forEach((input) => {
      this.validateField(input);
      if (!input.checkValidity()) {
        isFormValid = false;
      }
    });

    // Only submit if form is valid
    if (isFormValid) {
      this.setLoadingState();
      const formData = new FormData(this.form);
      this.submitForm(formData);
    } else {
      // Scroll to first error field
      const firstError = this.form.querySelector(".error");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        firstError.focus();
      }
    }
  },

  setLoadingState() {
    if (this.submitBtn) {
      this.submitBtn.classList.add("loading");
      this.submitBtn.innerHTML = "Enviando...";
      this.submitBtn.disabled = true;

      // Add loading state to form groups for visual feedback
      const formGroups = this.form.querySelectorAll(".form-group");
      formGroups.forEach((group) => {
        group.classList.add("loading");
      });
    }
  },

  restoreButtonState() {
    if (this.submitBtn) {
      this.submitBtn.classList.remove("loading");
      this.submitBtn.innerHTML = this.originalBtnContent;
      this.submitBtn.disabled = false;

      // Remove loading state from form groups
      const formGroups = this.form.querySelectorAll(".form-group");
      formGroups.forEach((group) => {
        group.classList.remove("loading");
      });
    }
  },

  clearAllValidation() {
    this.form.classList.remove("form-submitted");
    const allInputs = this.form.querySelectorAll("input, textarea");
    allInputs.forEach((input) => {
      this.clearFieldValidation(input);
    });
  },

  async submitForm(formData) {
    try {
      const response = await fetch(this.config.APPS_SCRIPT_URL, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      this.handleResponse(result);
    } catch (error) {
      console.error("Form submission error:", error);
      this.showMessage(
        "Error de conexión. Verifica tu internet e intenta nuevamente.",
        "error"
      );
    } finally {
      this.restoreButtonState();
    }
  },

  handleResponse(result) {
    if (result.status === "success") {
      this.showMessage(
        "¡Mensaje enviado correctamente! Te contactaremos pronto.",
        "success"
      );
      this.form.reset();
      this.clearAllValidation();
    } else if (result.status === "error") {
      const message = result.message?.includes("registro pendiente")
        ? "Tu email ya está registrado y tenemos tu consulta pendiente. Te contactaremos pronto."
        : result.message ||
          "Error al enviar el mensaje. Por favor intenta nuevamente.";

      const type = result.message?.includes("registro pendiente")
        ? "info"
        : "error";
      this.showMessage(message, type);
    } else {
      this.showMessage(
        "Error al enviar el mensaje. Por favor intenta nuevamente.",
        "error"
      );
    }
  },

  showMessage(message, type) {
    // Remove existing messages
    this.form.querySelectorAll(".form-message").forEach((msg) => msg.remove());

    const messageDiv = document.createElement("div");
    messageDiv.className = `form-message form-message-${type}`;
    messageDiv.textContent = message;

    messageDiv.style.cssText = `
            padding: 1rem;
            border-radius: 10px;
            margin-top: 1rem;
            font-weight: 500;
            text-align: center;
            background: ${
              this.config.messageTypes[type] || this.config.messageTypes.info
            };
            color: white;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s ease;
        `;

    this.form.appendChild(messageDiv);

    // Animate in
    setTimeout(() => {
      messageDiv.style.opacity = "1";
      messageDiv.style.transform = "translateY(0)";
    }, 10);

    // Animate out and remove after 6 seconds
    setTimeout(() => {
      messageDiv.style.opacity = "0";
      messageDiv.style.transform = "translateY(-10px)";
      setTimeout(() => messageDiv.remove(), 300);
    }, 6000);
  },
};

// Mobile menu functionality
document.addEventListener("DOMContentLoaded", function () {
  // Initialize theme system
  ThemeManager.init();
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  // Toggle mobile menu
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener("click", function () {
      const isOpen = navMenu.classList.contains("active");
      navMenu.classList.toggle("active");

      // Update ARIA attributes
      this.setAttribute("aria-expanded", !isOpen);
      this.setAttribute(
        "aria-label",
        !isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"
      );

      // Animate hamburger menu
      const spans = mobileMenuBtn.querySelectorAll("span");
      spans.forEach((span, index) => {
        if (navMenu.classList.contains("active")) {
          if (index === 0)
            span.style.transform = "rotate(45deg) translate(5px, 5px)";
          if (index === 1) span.style.opacity = "0";
          if (index === 2)
            span.style.transform = "rotate(-45deg) translate(7px, -6px)";
        } else {
          span.style.transform = "none";
          span.style.opacity = "1";
        }
      });
    });
  }

  // Close mobile menu when clicking on a link
  const allNavItems = document.querySelectorAll(".nav-link, .nav-cta-btn");
  allNavItems.forEach((link) => {
    link.addEventListener("click", function () {
      navMenu.classList.remove("active");
      mobileMenuBtn.setAttribute("aria-expanded", "false");
      mobileMenuBtn.setAttribute("aria-label", "Abrir menú de navegación");
      const spans = mobileMenuBtn.querySelectorAll("span");
      spans.forEach((span) => {
        span.style.transform = "none";
        span.style.opacity = "1";
      });
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener("click", function (e) {
    const isMenuOpen = navMenu.classList.contains("active");
    const clickedInsideMenu = navMenu.contains(e.target);
    const clickedMenuButton = mobileMenuBtn.contains(e.target);

    if (isMenuOpen && !clickedInsideMenu && !clickedMenuButton) {
      navMenu.classList.remove("active");
      mobileMenuBtn.setAttribute("aria-expanded", "false");
      mobileMenuBtn.setAttribute("aria-label", "Abrir menú de navegación");
      const spans = mobileMenuBtn.querySelectorAll("span");
      spans.forEach((span) => {
        span.style.transform = "none";
        span.style.opacity = "1";
      });
    }
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Header background on scroll - now managed by ThemeManager
  window.addEventListener("scroll", function () {
    const currentTheme = ThemeManager.getCurrentTheme();
    ThemeManager.updateHeaderBackground(currentTheme);

    // Update backdrop filter
    if (ThemeManager.elements.header) {
      const blur = window.scrollY > 100 ? "blur(20px)" : "blur(10px)";
      ThemeManager.elements.header.style.backdropFilter = blur;
    }
  });

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observe benefit items for animation
  const animatedElements = document.querySelectorAll(".benefit-item");
  animatedElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });

  // All CTA buttons now redirect to contact section - no modal needed

  // Parallax effect for hero section
  const hero = document.querySelector(".hero");
  window.addEventListener("scroll", function () {
    const scrolled = window.pageYOffset;
    const parallaxSpeed = 0.5;

    if (hero && scrolled < hero.offsetHeight) {
      hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
    }
  });

  // Services tabs functionality
  const serviceTabs = document.querySelectorAll(".service-tab");
  const serviceDetails = document.querySelectorAll(".service-detail");
  const servicePlaceholder = document.querySelector(".service-placeholder");

  // Initialize with placeholder active
  if (servicePlaceholder) {
    servicePlaceholder.classList.add("active");
  }

  serviceTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      // Check if this tab is already active - if so, don't execute the function
      if (this.classList.contains("active")) {
        return;
      }

      const serviceId = this.getAttribute("data-service");

      // Remove active class from all tabs and details
      serviceTabs.forEach((t) => t.classList.remove("active"));
      serviceDetails.forEach((d) => {
        d.classList.remove("active");
        d.style.display = "none";
      });
      if (servicePlaceholder) {
        servicePlaceholder.classList.remove("active");
      }

      // Add active class to clicked tab
      this.classList.add("active");

      // Show corresponding service detail with loading animation
      const targetDetail = document.getElementById(serviceId);
      if (targetDetail) {
        // Add loading state
        targetDetail.style.display = "block";
        targetDetail.classList.add("loading");

        // Simulate brief loading delay for UX
        setTimeout(() => {
          targetDetail.classList.remove("loading");
          targetDetail.classList.add("active");
        }, 300);
      }
    });

    // Add hover effect for tabs
    tab.addEventListener("mouseenter", function () {
      if (!this.classList.contains("active")) {
        this.style.transform = "translateX(8px)";
        this.style.boxShadow = "0 6px 25px rgba(107, 70, 193, 0.15)";
      }
    });

    tab.addEventListener("mouseleave", function () {
      if (!this.classList.contains("active")) {
        this.style.transform = "translateX(0)";
        this.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.05)";
      }
    });
  });

  // Reset to placeholder when clicking outside
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".services-tabs-container")) {
      // Optional: uncomment to reset to placeholder when clicking outside
      // serviceTabs.forEach(t => t.classList.remove('active'));
      // serviceDetails.forEach(d => {
      //     d.classList.remove('active');
      //     d.style.display = 'none';
      // });
      // servicePlaceholder.classList.add('active');
    }
  });

  // Lazy loading for better performance
  const lazyLoad = () => {
    const images = document.querySelectorAll("img[data-src]");
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.classList.add("lazy"); // Add loading animation

          // Create new image to preload
          const newImg = new Image();
          newImg.onload = () => {
            // Once loaded, replace src and remove loading
            img.src = img.dataset.src;
            img.classList.remove("lazy");
          };
          newImg.src = img.dataset.src;
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  };

  lazyLoad();

  // Floating buttons functionality
  const backToTopBtn = document.getElementById("backToTop");
  const heroSection = document.querySelector(".hero");

  // Show/hide back to top button after hero section
  if (backToTopBtn && heroSection) {
    window.addEventListener("scroll", function () {
      const heroHeight = heroSection.offsetHeight;

      // Show button when scrolled 60% of hero height
      if (window.scrollY > heroHeight * 0.6) {
        backToTopBtn.classList.add("show");
      } else {
        backToTopBtn.classList.remove("show");
      }
    });
  }

  // Back to top functionality
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // WhatsApp button pulse effect
  const whatsappBtn = document.querySelector(".whatsapp-btn");
  if (whatsappBtn) {
    setInterval(() => {
      whatsappBtn.style.transform = "scale(1.05)";
      setTimeout(() => {
        whatsappBtn.style.transform = "scale(1)";
      }, 200);
    }, 3000);
  }

  // Contact form handling - now modular
  ContactFormManager.init();

  // Mobile Accordion functionality
  const accordionHeaders = document.querySelectorAll(".accordion-header");

  accordionHeaders.forEach((header) => {
    header.addEventListener("click", function () {
      const currentlyActive = this.classList.contains("active");
      const content = this.nextElementSibling;

      // Close all accordion items
      accordionHeaders.forEach((h) => {
        h.classList.remove("active");
        h.nextElementSibling.classList.remove("active");
      });

      // If this item wasn't active, open it
      if (!currentlyActive) {
        this.classList.add("active");
        content.classList.add("active");
      }
    });
  });

  // Typing effect disabled to preserve colored text spans
  // const heroTitle = document.querySelector('.hero-title');
  // if (heroTitle) {
  //     const text = heroTitle.textContent;
  //     heroTitle.textContent = '';
  //     let i = 0;
  //
  //     const typeWriter = () => {
  //         if (i < text.length) {
  //             heroTitle.textContent += text.charAt(i);
  //             i++;
  //             setTimeout(typeWriter, 100);
  //         }
  //     };
  //
  //     // Start typing effect after a short delay
  //     setTimeout(typeWriter, 1000);
  // }
});
