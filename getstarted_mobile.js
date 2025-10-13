// getstarted_mobile.js

// --- Strict Mode & Global Constants ---
"use strict";
const INITIAL_SPLASH_DURATION_MS = 100;
const PAGE_TRANSITION_ANIMATION_MS = 300;
const CONSULTATION_PHP_SCRIPT_URL = 'send_consultation_request.php';

// --- Utility Functions ---
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// --- Initial Page Load & Global Logic ---
function initPageLoad() {
    const splashLoader = document.getElementById('splash-loader');
    const bodyElement = document.body;
    const mainContent = document.getElementById('main-content');

    if (!splashLoader || !bodyElement || !mainContent) {
        if(bodyElement) bodyElement.classList.add('loaded');
        return;
    }

    mainContent.style.visibility = 'hidden';
    mainContent.style.opacity = '0';
    document.documentElement.style.setProperty('--loader-display-duration', `${INITIAL_SPLASH_DURATION_MS / 1000}s`);

    setTimeout(() => {
        splashLoader.classList.add('hidden');
        mainContent.style.visibility = 'visible';
        mainContent.style.transition = `opacity ${PAGE_TRANSITION_ANIMATION_MS / 1000}s ease-out`;
        mainContent.style.opacity = '1';
        bodyElement.classList.add('loaded');
    }, INITIAL_SPLASH_DURATION_MS);
}
window.addEventListener('load', initPageLoad);

window.initScrollAnimations = function() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (!animatedElements.length || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.dataset.animationDelay) || 0;
                setTimeout(() => entry.target.classList.add('is-visible'), delay);
                obs.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    animatedElements.forEach(el => observer.observe(el));
};

window.addEventListener('pageshow', (event) => {
    document.getElementById('splash-loader')?.classList.add('hidden');
    document.getElementById('page-transition-loader')?.classList.add('hidden');
    if (event.persisted) {
        document.body.classList.add('loaded');
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.style.transition = 'none';
            mainContent.style.opacity = '1';
            mainContent.style.visibility = 'visible';
            setTimeout(() => {
                mainContent.style.transition = `opacity ${PAGE_TRANSITION_ANIMATION_MS / 1000}s ease-out`;
            }, 50);
        }
        if (typeof window.initScrollAnimations === 'function') setTimeout(window.initScrollAnimations, 100);
    }
});


// --- DOMContentLoaded Event Listener ---
document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');

    // 1. Page Transition Logic
    function initPageTransitions() {
        const transitionLoader = document.getElementById('page-transition-loader');
        if (!transitionLoader || !mainContent) return;
        document.querySelectorAll('a[href]:not([href^="#"]):not([href^="tel:"]):not([href^="mailto:"]):not([href^="javascript:"]):not([target="_blank"])')
            .forEach(link => {
                link.addEventListener('click', (e) => {
                    const dest = new URL(link.href);
                    if (dest.hostname !== window.location.hostname) return;
                    if (dest.pathname === window.location.pathname && dest.search === window.location.search) {
                        e.preventDefault(); return;
                    }
                    e.preventDefault();
                    mainContent.style.opacity = '0';
                    transitionLoader.classList.remove('hidden');
                    setTimeout(() => { window.location.href = link.href; }, PAGE_TRANSITION_ANIMATION_MS + 50);
                });
            });
    }
    initPageTransitions();

    // 2. Footer Year
    function updateFooterYear() {
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    }
    updateFooterYear();

    // 3. Scroll Animations
    if (typeof window.initScrollAnimations === 'function') window.initScrollAnimations();

    // 4. Sticky Header Behavior (Unified)
    function initStickyHeaderBehavior() {
        const header = document.getElementById('site-header');
        if (!header) return;
        let lastScrollTop = 0;
        const handleScroll = debounce(() => {
            let st = window.pageYOffset || document.documentElement.scrollTop;
            if (st > lastScrollTop && st > header.offsetHeight) {
                header.classList.add('scrolled-down');
            } else {
                header.classList.remove('scrolled-down');
            }
            lastScrollTop = st <= 0 ? 0 : st;
        }, 100);
        window.addEventListener('scroll', handleScroll, { passive: true });
    }
    initStickyHeaderBehavior();

    // 5. Phone Number Formatting
    function initPhoneFormatting() {
        const phoneInput = document.getElementById('phone');
        if (!phoneInput) return;
        phoneInput.addEventListener('input', (e) => {
            const x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : `${x[1]}-${x[2]}` + (x[3] ? `-${x[3]}` : '');
        });
    }
    initPhoneFormatting();

    // 6. Consultation Form Logic
    function initConsultationForm() {
        const form = document.getElementById('consultation-request-form');
        const formWrapper = document.getElementById('consultation-form-wrapper');
        const thankYouDiv = document.getElementById('thank-you-message');
        const submitButton = document.getElementById('consultation-submit-button');
        const submitButtonText = submitButton?.querySelector('.submit-button-text');
        const formErrorDiv = document.getElementById('form-error-message');
        const resetButton = document.getElementById('reset-form-button');

        if (!form || !formWrapper || !thankYouDiv || !submitButton || !submitButtonText || !formErrorDiv || !resetButton) return;
        
        const formInputs = Array.from(form.querySelectorAll('input[required], select[required], textarea[required]'));

        function validateInput(input) {
            input.classList.remove('input-valid', 'input-error');
            let isValid = true;
            const value = input.value.trim();

            if (input.required && !value) isValid = false;
            if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) isValid = false;
            if (input.type === 'tel' && input.required && value.length < 12) isValid = false;
            if (input.type === 'number' && input.required && (isNaN(value) || Number(value) < (Number(input.min) || 0))) isValid = false;

            if (input.dataset.touched === "true") {
                if(isValid) {
                    input.classList.add('input-valid');
                } else {
                    input.classList.add('input-error');
                }
            }
            return isValid;
        }

        formInputs.forEach(input => {
            const eventType = input.tagName.toLowerCase() === 'select' ? 'change' : 'input';
            input.addEventListener('blur', () => {
                input.dataset.touched = "true";
                validateInput(input);
            });
            input.addEventListener(eventType, () => {
                 if(input.dataset.touched === "true") validateInput(input);
            });
        });

        function resetTurnstile() {
            if (window.turnstile) {
                const widgetElement = form.querySelector('.cf-turnstile');
                if (widgetElement) {
                     window.turnstile.reset(widgetElement);
                }
            }
        }

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            formInputs.forEach(input => input.dataset.touched = "true");
            const isFormValid = formInputs.map(validateInput).every(v => v);

            // Check for Turnstile token
            const turnstileToken = form.querySelector('input[name="cf-turnstile-response"]')?.value;

            if (!isFormValid) {
                formErrorDiv.textContent = 'Please fill out all highlighted required fields correctly.';
                formErrorDiv.style.display = 'block';
                form.querySelector('.input-error')?.focus();
                return;
            }

            if (!turnstileToken) {
                formErrorDiv.textContent = 'Please complete the CAPTCHA check.';
                formErrorDiv.style.display = 'block';
                return;
            }
            
            formErrorDiv.style.display = 'none';
            submitButton.disabled = true;
            submitButtonText.textContent = 'Sending...';

            try {
                const response = await fetch(CONSULTATION_PHP_SCRIPT_URL, {
                    method: 'POST',
                    body: new FormData(form)
                });
                const result = await response.json();

                if (response.ok && result.status === 'success') {
                    formWrapper.style.display = 'none';
                    thankYouDiv.style.display = 'block';
                    thankYouDiv.classList.add('visible');
                    thankYouDiv.focus();
                } else {
                    throw new Error(result.message || 'An unknown error occurred.');
                }
            } catch (error) {
                formErrorDiv.textContent = error.message || 'A network error occurred. Please try again.';
                formErrorDiv.style.display = 'block';
                resetTurnstile();
            } finally {
                submitButton.disabled = false;
                submitButtonText.textContent = 'Submit Request';
            }
        });

        resetButton.addEventListener('click', () => {
            thankYouDiv.style.display = 'none';
            thankYouDiv.classList.remove('visible');
            formWrapper.style.display = 'block';
            form.reset();
            formInputs.forEach(input => {
                input.classList.remove('input-valid', 'input-error');
                delete input.dataset.touched;
            });
            form.querySelector('input, select, textarea')?.focus();
            resetTurnstile();
        });
    }
    initConsultationForm();
});
