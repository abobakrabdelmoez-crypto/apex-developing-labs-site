/**
 * APEX TRANSFORMATION — Main Script
 * Handles navigation, animations, form logic, and interactive elements.
 */
// Anti-Spam Setup
const formStartTime = Date.now();

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     1. NAVIGATION SCROLL & MOBILE MENU
     ============================================================ */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const navLinksItems = document.querySelectorAll('.nav__link');

  // Handle scroll effect for nav
  const handleScroll = () => {
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Init

  // Handle mobile menu toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = !isExpanded ? 'hidden' : '';
    });
  }

  // Close mobile menu on link click
  navLinksItems.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });


  /* ============================================================
     2. SCROLL REVEAL ANIMATIONS (Intersection Observer)
     ============================================================ */
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length > 0) {
    const revealOptions = {
      root: null,
      rootMargin: '0px 0px -100px 0px',
      threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Only animate once
          observer.unobserve(entry.target);
        }
      });
    }, revealOptions);

    revealElements.forEach(el => {
      revealObserver.observe(el);
    });
  }


  /* ============================================================
     3. FAQ ACCORDION
     ============================================================ */
  const faqQuestions = document.querySelectorAll('.faq__question');

  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const item = question.parentElement;
      const isOpen = item.classList.contains('open');

      // Close all other FAQs
      document.querySelectorAll('.faq__item').forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('open');
          otherItem.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current FAQ
      if (isOpen) {
        item.classList.remove('open');
        question.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

});


/* ============================================================
   4. MULTI-STEP FORM LOGIC
   ============================================================ */
let currentStep = 1;
const totalSteps = 3;

function updateProgress() {
  const bars = document.querySelectorAll('.form-progress__bar');

  bars.forEach(bar => {
    const stepNum = parseInt(bar.getAttribute('data-step'));

    // Reset classes
    bar.classList.remove('active', 'completed');

    if (stepNum < currentStep) {
      bar.classList.add('completed');
    } else if (stepNum === currentStep) {
      bar.classList.add('active');
    }
  });
}

function showStep(stepIndex) {
  // Hide all steps
  document.querySelectorAll('.form-step').forEach(step => {
    step.classList.remove('active');
  });

  // Show target step
  const targetStep = document.querySelector(`.form-step[data-step="${stepIndex}"]`);
  if (targetStep) {
    targetStep.classList.add('active');
  }

  currentStep = stepIndex;
  updateProgress();
}

function validateStep(stepIndex) {
  let isValid = true;
  const currentStepEl = document.querySelector(`.form-step[data-step="${stepIndex}"]`);

  if (!currentStepEl) return false;

  // Find all required inputs in current step
  const requiredInputs = currentStepEl.querySelectorAll('[required]');

  requiredInputs.forEach(input => {
    const errorEl = document.getElementById(`${input.id}Error`);

    if (!input.value.trim()) {
      isValid = false;
      input.style.borderColor = 'var(--accent-danger)';
      if (errorEl) errorEl.classList.add('visible');
    } else {
      input.style.borderColor = '';
      if (errorEl) errorEl.classList.remove('visible');
    }
  });

  return isValid;
}

function nextStep(currentStepIndex) {
  if (validateStep(currentStepIndex)) {
    if (currentStepIndex < totalSteps) {
      showStep(currentStepIndex + 1);
      // Scroll to top of form
      const formCard = document.getElementById('formCard');
      if (formCard) {
        const y = formCard.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  }
}

function prevStep(currentStepIndex) {
  if (currentStepIndex > 1) {
    showStep(currentStepIndex - 1);
  }
}

// Handle Form Submission
document.addEventListener('DOMContentLoaded', () => {
  const strategicForm = document.getElementById('strategicForm');

  if (strategicForm) {
    // 1. Load saved draft if exists
    const savedData = localStorage.getItem('apex_form_draft');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        Object.keys(data).forEach(id => {
          const el = document.getElementById(id);
          if (el) el.value = data[id];
        });
      } catch(e) {}
    }

    // 2. Auto-save form draft on input
    strategicForm.querySelectorAll('input, textarea, select').forEach(input => {
      input.addEventListener('input', () => {
        const currentData = JSON.parse(localStorage.getItem('apex_form_draft') || '{}');
        if (input.id && input.id !== 'bot_check_field') {
          currentData[input.id] = input.value;
          localStorage.setItem('apex_form_draft', JSON.stringify(currentData));
        }
      });
    });

    // 3. WhatsApp Validation (Numbers and + only)
    const whatsappInput = document.getElementById('whatsapp');
    if (whatsappInput) {
      whatsappInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^\d+]/g, '');
      });
    }

    strategicForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // ════════════════════════════════════════
      // ANTI-SPAM PROTECTION
      // ════════════════════════════════════════
      
      // 1. Honeypot Check (Bots fill hidden fields)
      const honeypot = document.getElementById('bot_check_field');
      if (honeypot && honeypot.value !== "") {
        console.warn("Spam blocked: Honeypot filled.");
        showFakeSuccess();
        return;
      }
      
      // 2. Speed Check (Bots submit instantly, humans take > 5s)
      if (Date.now() - formStartTime < 5000) {
        console.warn("Spam blocked: Submitted too fast.");
        showFakeSuccess();
        return;
      }
      
      // 3. Rate Limiting Check (1 hour cooldown per device)
      const lastSubmit = localStorage.getItem('apex_last_submit');
      if (lastSubmit && (Date.now() - parseInt(lastSubmit)) < 3600000) {
        console.warn("Spam blocked: Rate limit.");
        showFakeSuccess();
        return;
      }

      function showFakeSuccess() {
        strategicForm.style.display = 'none';
        const progress = document.getElementById('formProgress');
        if(progress) progress.style.display = 'none';
        document.getElementById('formSuccess').classList.add('visible');
      }

      if (validateStep(totalSteps)) {
        // Record successful submission time
        localStorage.setItem('apex_last_submit', Date.now().toString());
        // Change button state
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'جاري الإرسال...';
        submitBtn.style.opacity = '0.7';
        submitBtn.style.pointerEvents = 'none';

        // Simulate API call and Save to LocalStorage
        setTimeout(() => {
          // Collect data
          const requestData = {
            id: Date.now(),
            date: new Date().toLocaleString('ar-EG'),
            companyName: document.getElementById('companyName').value,
            sector: document.getElementById('sector').value,
            location: document.getElementById('location').value,
            hasTeam: document.getElementById('hasTeam').value,
            vision: document.getElementById('vision').value,
            challenge: document.getElementById('challenge').value,
            digitalPresence: document.getElementById('digitalPresence').value,
            triedBefore: document.getElementById('triedBefore').value,
            readyToInvest: document.getElementById('readyToInvest').value,
            whatsapp: document.getElementById('whatsapp').value,
            email: document.getElementById('email').value,
            linkedin: document.getElementById('linkedin').value || '',
            instagram: document.getElementById('instagram').value || '',
            status: 'new'
          };

          // إعداد البيانات للإرسال
          const formData = new URLSearchParams();
          for (const key in requestData) {
            formData.append(key, requestData[key]);
          }

          // تم إخفاء الرابط السري تماماً!
          // نقوم بإرسال البيانات إلى السيرفر الداخلي المخفي (Vercel API)
          fetch('/api/submit', {
            method: 'POST',
            body: formData
          }).catch(error => console.error('Error sending data:', error));

          // Save to localStorage for Admin Board (نسخة احتياطية محلية)
          let requests = JSON.parse(localStorage.getItem('apex_requests') || '[]');
          requests.unshift(requestData);
          localStorage.setItem('apex_requests', JSON.stringify(requests));
          
          // Clear draft on success
          localStorage.removeItem('apex_form_draft');

          // Show Success State
          strategicForm.style.display = 'none';
          document.getElementById('formProgress').style.display = 'none';
          document.getElementById('formSuccess').classList.add('visible');

          // Scroll to success message
          const formCard = document.getElementById('formCard');
          if (formCard) {
            const y = formCard.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 1200);
      }
    });
  }

  // Clear error on input
  document.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(input => {
    input.addEventListener('input', () => {
      input.style.borderColor = '';
      const errorEl = document.getElementById(`${input.id}Error`);
      if (errorEl) {
        errorEl.classList.remove('visible');
      }
    });
  });
});
