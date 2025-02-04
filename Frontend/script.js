// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  initAnimations();
  initScrollEffects();
  initDarkMode();
  initHamburgerMenu();
  initForms();
  initChatBot();
});

// Animation Initialization
function initAnimations() {
  gsap.registerEffect({
    name: "fadeSlide",
    effect: (targets, config) => {
      return gsap.from(targets, {
        duration: config.duration || 1,
        opacity: 0,
        y: config.y || 0,
        ease: "power4.out",
        stagger: config.stagger || 0
      });
    }
  });

  // Hero Section Animations
  gsap.effects.fadeSlide('.hero-content h1', { y: -50 });
  gsap.effects.fadeSlide('.hero-content p', { y: 50, delay: 0.5 });
  gsap.effects.fadeSlide('.cta-buttons a', { 
    scale: 0.8,
    duration: 0.8,
    delay: 1,
    stagger: 0.2
  });
}

// Scroll Effects with Intersection Observer
function initScrollEffects() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.25
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        gsap.to(entry.target, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out"
        });
      }
    });
  }, observerOptions);

  document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    sectionObserver.observe(section);
  });
}

// Dark Mode Functionality
function initDarkMode() {
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const body = document.body;

  const setDarkModeState = (isDark) => {
    body.classList.toggle('dark-mode', isDark);
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
    darkModeToggle.checked = isDark;
  };

  // Initialize from localStorage
  const savedMode = localStorage.getItem('darkMode');
  setDarkModeState(savedMode === 'enabled');

  // Toggle event listener
  darkModeToggle.addEventListener('change', () => {
    setDarkModeState(darkModeToggle.checked);
  });
}

// Hamburger Menu Functionality
function initHamburgerMenu() {
  const hamburger = document.querySelector('.hamburger-menu');
  const navbarCollapse = document.getElementById('navbarNav');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navbarCollapse.classList.toggle('show');
  });

  // Close menu on click outside
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navbarCollapse.contains(e.target)) {
      hamburger.classList.remove('active');
      navbarCollapse.classList.remove('show');
    }
  });
}

// Form Handling System
function initForms() {
  const formConfigs = [
    { id: 'registrationForm', endpoint: '/register' },
    { id: 'contactForm', endpoint: '/contact' }
  ];

  formConfigs.forEach(config => {
    const form = document.getElementById(config.id);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateForm(form)) return;

      try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        const response = await fetch(config.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        handleFormResponse(form, await response.json());
      } catch (error) {
        handleFormError(form, error);
      }
    });
  });
}

function validateForm(form) {
  let isValid = true;
  form.querySelectorAll('[required]').forEach(field => {
    if (!field.value.trim()) {
      isValid = false;
      field.classList.add('is-invalid');
    }
  });
  return isValid;
}

function handleFormResponse(form, response) {
  if (response.success) {
    form.reset();
    showToast('Form submitted successfully!', 'success');
  } else {
    showToast(response.message || 'Submission failed', 'error');
  }
}

function handleFormError(form, error) {
  console.error('Form Error:', error);
  showToast('An error occurred. Please try again.', 'error');
}

// Enhanced Chat Functionality
function initChatBot() {
  const chat = {
    toggle: document.querySelector('.chat-toggle'),
    container: document.querySelector('.chat-container'),
    closeBtn: document.querySelector('.chat-close'),
    input: document.getElementById('user-input'),
    sendBtn: document.getElementById('send-btn'),
    messages: document.querySelector('.chat-messages'),
    typingIndicator: createTypingIndicator(),
    isProcessing: false
  };

  // Initialize chat
  chat.messages.appendChild(chat.typingIndicator);

  // Toggle Chat Visibility
  chat.toggle.addEventListener('click', () => toggleChat(true));
  chat.closeBtn.addEventListener('click', () => toggleChat(false));

  // Message Handling
  chat.sendBtn.addEventListener('click', handleSendMessage);
  chat.input.addEventListener('keypress', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  async function handleSendMessage() {
    if (chat.isProcessing) return;
    
    const message = chat.input.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    chat.input.value = '';
    chat.input.focus();
    
    showTyping();
    await simulateResponse(message);
    hideTyping();
  }

  function simulateResponse(message) {
    return new Promise(resolve => {
      setTimeout(async () => {
        try {
          const response = await getBotResponse(message);
          addMessage(response, 'bot');
        } catch (error) {
          addMessage("Sorry, I'm having trouble connecting. Please try again later.", 'bot');
        }
        resolve();
      }, 800); // Simulated API delay
    });
  }

  function getBotResponse(message) {
    // Replace with actual API call
    const responses = {
      hello: "Hello! How can I assist you today? 😊",
      help: "I can help with:\n- Booking rides\n- Service info\n- Account issues\nWhat do you need?",
      payment: "We accept mobile money and credit cards. Which would you prefer?",
      default: "I'll connect you with a human agent. One moment please... ⏳"
    };
    
    const cleanMsg = message.toLowerCase();
    return responses[cleanMsg] || responses.default;
  }

  function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.innerHTML = `
      <div class="message-content">${text}</div>
      <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
    `;
    
    chat.messages.appendChild(messageDiv);
    scrollToBottom();
    animateMessage(messageDiv);
  }

  function animateMessage(element) {
    gsap.from(element, {
      duration: 0.3,
      opacity: 0,
      y: 20,
      ease: "power2.out"
    });
  }

  function scrollToBottom() {
    chat.messages.scrollTo({
      top: chat.messages.scrollHeight,
      behavior: 'smooth'
    });
  }

  function showTyping() {
    chat.isProcessing = true;
    chat.typingIndicator.style.display = 'flex';
    scrollToBottom();
  }

  function hideTyping() {
    chat.isProcessing = false;
    chat.typingIndicator.style.display = 'none';
  }

  function createTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'typing-indicator';
    div.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
    return div;
  }

  function toggleChat(show) {
    chat.container.classList.toggle('active', show);
    if (show) {
      chat.input.focus();
      scrollToBottom();
    }
  }
}

async function getBotResponse(message) {
  try {
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) throw new Error('API request failed');
    
    const data = await response.json();
    return data.response || "Hmm, I'm not sure how to respond to that.";

  } catch (error) {
    console.error('Chat API Error:', error);
    return "Sorry, I'm having trouble connecting. Please try again later.";
  }
}


// Registration Form Handling
if (document.getElementById('registrationForm')) {
  document.getElementById('registrationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const loader = createLoader();
    
    try {
      submitBtn.disabled = true;
      submitBtn.appendChild(loader);

      const formData = {
        name: form.name.value,
        email: form.email.value,
        password: form.password.value
      };

      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      showToast('Registration successful! Redirecting...', 'success');
      form.reset();
      setTimeout(() => {
        window.location.href = '/login.html'; // Update with your login page
      }, 2000);

    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      submitBtn.disabled = false;
      loader.remove();
    }
  });
}

// Contact Form Handling
if (document.getElementById('contactForm')) {
  document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const loader = createLoader();

    try {
      submitBtn.disabled = true;
      submitBtn.appendChild(loader);

      const formData = {
        name: form.name.value,
        email: form.email.value,
        message: form.message.value
      };

      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Message sending failed');
      }

      showToast('Message sent successfully!', 'success');
      form.reset();

    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      submitBtn.disabled = false;
      loader.remove();
    }
  });
}

// Utility functions
function createLoader() {
  const loader = document.createElement('div');
  loader.className = 'loader';
  return loader;
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}


// Add to script.js
if (document.getElementById('bookingForm')) {
  const fareDisplay = document.getElementById('fareDisplay');
  let currentEstimation = null;

  // Fare Estimation
  async function estimateFare() {
    const pickup = document.getElementById('pickup').value;
    const destination = document.getElementById('destination').value;
    const rideType = document.getElementById('ride-type').value;

    if (!pickup || !destination) return;

    try {
      const response = await fetch('http://localhost:5000/api/estimate-fare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickup, destination, rideType })
      });

      const data = await response.json();
      
      if (data.success) {
        currentEstimation = data.estimation;
        fareDisplay.textContent = `Estimated Fare: GHC ${data.estimation.fare}`;
        fareDisplay.style.display = 'block';
      }
    } catch (error) {
      fareDisplay.textContent = 'Fare estimation unavailable';
    }
  }

  // Event Listeners for auto-estimate
  document.getElementById('pickup').addEventListener('input', estimateFare);
  document.getElementById('destination').addEventListener('input', estimateFare);
  document.getElementById('ride-type').addEventListener('change', estimateFare);

  // Ride Booking Form Submission
  document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const loader = createLoader();

    try {
      submitBtn.disabled = true;
      submitBtn.appendChild(loader);

      // Get logged in user ID (replace with actual auth system)
      const userId = localStorage.getItem('userId'); // Example using localStorage

      const formData = {
        userId,
        pickup: form.pickup.value,
        destination: form.destination.value,
        rideType: form['ride-type'].value
      };

      const response = await fetch('http://localhost:5000/api/book-ride', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ride booking failed');
      }

      showToast('Ride booked successfully! Driver arriving soon 🏍️', 'success');
      form.reset();
      fareDisplay.style.display = 'none';

    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      submitBtn.disabled = false;
      loader.remove();
    }
  });
}