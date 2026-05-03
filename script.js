/**
 * ALPS Landing Page Script
 */

console.log("ALPS script loaded successfully.");

document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("main-header");

  // ---- Accordion Logic ----
  const accordionSection = document.getElementById("what-makes-us-different");
  const accordionTabs = accordionSection ? accordionSection.querySelectorAll(".wmu-tab") : [];
  const accordionPanels = accordionSection ? accordionSection.querySelectorAll(".wmu-panel") : [];
  let defaultAccordionOpened = false;
  let defaultOpenTimeout = null;

  function closeAllAccordionTabs() {
    accordionTabs.forEach((t) => {
      t.classList.remove("is-open");
      t.setAttribute("aria-expanded", "false");
    });
    accordionPanels.forEach((panel) => {
      panel.classList.remove("active");
      panel.setAttribute("aria-hidden", "true");
    });
  }

  function openAccordionTab(tab) {
    if (!tab || !accordionPanels.length) return;
    const targetId = tab.getAttribute("data-panel");
    const targetPanel = accordionSection.querySelector("#" + targetId);

    closeAllAccordionTabs();
    tab.classList.add("is-open");
    tab.setAttribute("aria-expanded", "true");
    if (targetPanel) {
      targetPanel.classList.add("active");
      targetPanel.setAttribute("aria-hidden", "false");
    }
  }

  // ---- Reveal (Trigger ONCE) ----
  const handleScroll = () => {
    if (window.scrollY > 50) header?.classList.add("scrolled");
    else header?.classList.remove("scrolled");

    // Fade in `.reveal` elements, but NEVER remove the 'active' class once it's added
    const revealElements = document.querySelectorAll(".reveal");
    revealElements.forEach((el) => {
      const elementTop = el.getBoundingClientRect().top;
      if (elementTop < window.innerHeight * 0.85) {
        el.classList.add("active");
      }
    });

    if (accordionSection && accordionTabs.length > 0 && !defaultAccordionOpened) {
      const tabs = accordionSection.querySelectorAll(".wmu-tab.reveal");
      const allTabsRevealed = Array.from(tabs).every((tab) => tab.classList.contains("active"));

      if (allTabsRevealed) {
        defaultAccordionOpened = true;
        clearTimeout(defaultOpenTimeout);
        defaultOpenTimeout = setTimeout(() => {
          const r = accordionSection.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) {
            openAccordionTab(accordionTabs[0]);
          }
        }, 1200); 
      }
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll(); 

  if (accordionTabs.length > 0) {
    accordionTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        if (!tab.classList.contains("is-open")) {
          openAccordionTab(tab);
        }
      });
    });
  }

  // ---- Video overlay ----
  const video = document.getElementById("alps-video");
  const overlay = document.getElementById("video-overlay");

  if (video && overlay) {
    video.volume = 0.5;
    overlay.addEventListener("click", () => {
      video.play();
      overlay.classList.add("hidden");
      video.setAttribute("controls", "controls");
    });
  }

  // ---- How It Works slider ----
  const slider = document.getElementById("howSlider");
  if (slider) {
    const track = slider.querySelector(".how-track");
    const slides = slider.querySelectorAll(".how-slide");
    
    if (track && slides.length > 0) {
      let index = 0;
      let startX = 0;
      let currentX = 0;
      let isDragging = false;

      const goToSlide = (i) => {
        index = (i + slides.length) % slides.length;
        track.style.transform = `translateX(-${index * 100}%)`;
      };

      goToSlide(0);
      let autoTimer = setInterval(() => goToSlide(index + 1), 15000);

      const resetAuto = () => {
        clearInterval(autoTimer);
        autoTimer = setInterval(() => goToSlide(index + 1), 15000);
      };

      slider.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
        currentX = startX;
        isDragging = true;
      }, { passive: true });

      slider.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
      }, { passive: true });

      slider.addEventListener("touchend", () => {
        if (!isDragging) return;
        const diff = startX - currentX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? goToSlide(index + 1) : goToSlide(index - 1);
          resetAuto();
        }
        isDragging = false;
      });

      slider.addEventListener("mousedown", (e) => {
        startX = e.clientX;
        currentX = startX;
        isDragging = true;
      });

      window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        currentX = e.clientX;
      });

      window.addEventListener("mouseup", () => {
        if (!isDragging) return;
        const diff = startX - currentX;
        if (Math.abs(diff) > 60) {
          diff > 0 ? goToSlide(index + 1) : goToSlide(index - 1);
          resetAuto();
        }
        isDragging = false;
      });
    }
  }

  // ---- Carousel Logic ----
  const carouselData = [
    { 
      label: "Interactive Learning Modules",
      title: "Interactive Learning <span class='highlight-pink'>Modules</span>",
      desc: "Self-paced, microlearning units designed for focused comprehension and retention.",
      type: "video",
      src: "video1.mp4" 
    },
    { 
      label: "Opening module screen",
      title: "Public Trust <span class='highlight-pink'>Screens</span>",
      desc: "Reinforcing integrity and accountability to build lasting community confidence.",
      type: "video",
      src: "video2.mp4" 
    },
    { 
      label: "Decision-Based Scenarios",
      title: "Decision-Based <span class='highlight-pink'>Scenarios</span>",
      desc: "Branching paths that allow learners to see the consequences of their choices in real-time.",
      type: "video",
      src: "video3.mp4" 
    }
  ];

  let currentIdx = 0;
  const slotL = document.getElementById('slotLeft');
  const slotC = document.getElementById('slotCenter');
  const slotR = document.getElementById('slotRight');
  const legTitle = document.getElementById('legendTitle');
  const legDesc = document.getElementById('legendDesc');

  function getMediaHTML(item, isCenter) {
    const controls = isCenter ? "controls" : ""; 
    return `<video src="${item.src}" ${controls} preload="metadata" style="width:100%; height:100%; object-fit:cover; border-radius:8px;"></video>`;
  }

  if (slotL && slotC && slotR) {
    function updateCarousel() {
      const total = carouselData.length;
      const leftIdx = (currentIdx - 1 + total) % total;
      const centerIdx = (currentIdx + total) % total;
      const rightIdx = (currentIdx + 1 + total) % total;

      slotL.innerHTML = getMediaHTML(carouselData[leftIdx], false);
      slotC.innerHTML = getMediaHTML(carouselData[centerIdx], true);
      slotR.innerHTML = getMediaHTML(carouselData[rightIdx], false);

      if (legTitle) legTitle.innerHTML = carouselData[centerIdx].title;
      if (legDesc) legDesc.innerText = carouselData[centerIdx].desc;
    }

    document.getElementById('carouselPrev')?.addEventListener('click', () => { currentIdx--; updateCarousel(); });
    document.getElementById('carouselNext')?.addEventListener('click', () => { currentIdx++; updateCarousel(); });
    updateCarousel();
  }

  // ---- DYNAMIC SCROLL OBSERVER (Trigger ONCE) ----
  const scrollOptions = {
    root: null,
    threshold: 0.1, 
    rootMargin: "0px 0px -100px 0px" 
  };

  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Unobserve the element so it stays visible forever
        observer.unobserve(entry.target);
      }
    });
  }, scrollOptions);

  document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    scrollObserver.observe(el);
  });

  // --- CONTACT FORM BACKEND CONNECTION ---
  const inquiryForm = document.getElementById('inquiry-form');
  const formSuccess = document.getElementById('form-success');
  const submitBtn = document.querySelector('.contact-submit-btn');
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwqrr15K1ZLlssChMnOQDZ8qBtaPfBg-qteZNZ8bhiRnsIQD4eIal4BvetbR6mfvnXa6g/exec";

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (submitBtn) {
          submitBtn.innerText = "Sending...";
          submitBtn.style.opacity = "0.7";
          submitBtn.disabled = true;
      }

      let requestBody = new FormData(inquiryForm);

      fetch(SCRIPT_URL, { method: 'POST', body: requestBody })
        .then(response => {
           inquiryForm.style.display = 'none'; 
           if (formSuccess) formSuccess.style.display = 'block'; 
           console.log('Success!', response);
        })
        .catch(error => {
           console.error('Error!', error.message);
           if (submitBtn) {
               submitBtn.innerText = "Error. Refresh Page.";
               submitBtn.disabled = false;
               submitBtn.style.opacity = "1";
           }
        });
    });
  }
});

