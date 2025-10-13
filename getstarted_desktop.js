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

// --- Page Load & Initial Setup ---

function initFooterYear() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

function initDesktopNavActiveTab() {
    const desktopLinks = document.querySelectorAll('.desktop-nav .nav-link');
    if (!desktopLinks.length) return;
    
    let currentPage = window.location.pathname.split('/').pop() || 'index_desktop.html';

    desktopLinks.forEach(link => {
        const linkTarget = link.getAttribute('href');
        link.classList.remove('active');
        link.removeAttribute('aria-current');
        // Simple check for the current file name
        if (linkTarget === currentPage) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
}

function initStickyHeaderBehavior() {
    const header = document.getElementById('site-header');
    if (!header) return;

    let lastScrollTop = 0;
    const delta = 10;
    const headerHeight = header.offsetHeight;

    const handleScroll = debounce(() => {
        const nowST = window.pageYOffset || document.documentElement.scrollTop;
        
        if (Math.abs(lastScrollTop - nowST) <= delta) return;

        if (nowST > lastScrollTop && nowST > headerHeight) {
             header.classList.add('scrolled-down');
        } else if (nowST + window.innerHeight < document.documentElement.scrollHeight) {
             header.classList.remove('scrolled-down');
        }
        lastScrollTop = nowST <= 0 ? 0 : nowST;
    }, 25);

    window.addEventListener('scroll', handleScroll, { passive: true });
}

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


// --- Main DOM Ready and Page Load Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    
    initFooterYear();
    initDesktopNavActiveTab();
    initStickyHeaderBehavior();

    const mainContent = document.getElementById('main-content');
    
    // 1. Page Transition Logic
    function initPageTransitions() {
        const transitionLoader = document.getElementById('page-transition-loader');
        // Note: The loader element is not present in the new HTML, only keeping the logic for forward compatibility
        if (!mainContent) return; 

        document.querySelectorAll('a[href]:not([href^="#"]):not([href^="tel:"]):not([href^="mailto:"]):not([href^="javascript:"]):not([target="_blank"])')
            .forEach(link => {
                link.addEventListener('click', (e) => {
                    const dest = new URL(link.href);
                    if (dest.hostname !== window.location.hostname) return;
                    if (dest.pathname === window.location.pathname && dest.search === window.location.search) {
                        e.preventDefault(); return;
                    }
                    e.preventDefault();
                    // Smooth transition out
                    mainContent.style.opacity = '0'; 
                    // if (transitionLoader) transitionLoader.classList.remove('hidden'); 
                    setTimeout(() => { window.location.href = link.href; }, PAGE_TRANSITION_ANIMATION_MS + 50);
                });
            });
    }
    initPageTransitions();

    // 2. Scroll Animations
    if (typeof window.initScrollAnimations === 'function') window.initScrollAnimations();

    // 3. Phone Number Formatting
    function initPhoneFormatting() {
        const phoneInput = document.getElementById('phone');
        if (!phoneInput) return;
        phoneInput.addEventListener('input', (e) => {
            const x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : `${x[1]}-${x[2]}` + (x[3] ? `-${x[3]}` : '');
        });
    }
    initPhoneFormatting();

    // 4. Consultation Form Logic
    function initConsultationForm() {
        const form = document.getElementById('consultation-request-form');
        const formWrapper = document.getElementById('consultation-form-wrapper');
        const thankYouDiv = document.getElementById('thank-you-message');
        const submitButton = document.getElementById('consultation-submit-button');
        const submitButtonText = submitButton?.querySelector('.submit-button-text');
        const formErrorDiv = document.getElementById('form-error-message');
        const resetButton = document.getElementById('reset-form-button');

        if (!form || !formWrapper || !thankYouDiv || !submitButton || !submitButtonText || !formErrorDiv || !resetButton) return;
        
        // Include email and phone in required inputs for validation
        const formInputs = Array.from(form.querySelectorAll('input[required], select[required], textarea[required]'));

        function validateInput(input) {
            input.classList.remove('input-valid', 'input-error');
            let isValid = true;
            const value = input.value.trim();

            if (input.required && !value) isValid = false;
            // Enhanced email validation
            if (input.type === 'email' && value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) isValid = false;
            // Enhanced phone validation (must match the pattern in the HTML and be complete)
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

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            formInputs.forEach(input => input.dataset.touched = "true");
            const isFormValid = formInputs.map(validateInput).every(v => v);
            
            // Check Turnstile token (if present)
            const turnstileResponse = form.querySelector('input[name="cf-turnstile-response"]')?.value;
            const isTurnstileValid = !!turnstileResponse;

            if (!isFormValid || !isTurnstileValid) {
                formErrorDiv.textContent = 'Please fill out all highlighted required fields and complete the security check.';
                formErrorDiv.style.display = 'block';
                form.querySelector('.input-error')?.focus() || form.querySelector('.cf-turnstile')?.scrollIntoView({ behavior: 'smooth' });
                return;
            }
            
            formErrorDiv.style.display = 'none';
            submitButton.disabled = true;
            submitButtonText.textContent = 'Sending...';
            const icon = submitButton.querySelector('i');
            const originalIconClass = icon.className;
            icon.className = 'fas fa-spinner fa-spin';

            try {
                // IMPORTANT: The actual fetch call to a server-side script is needed here. 
                // Using a placeholder/simulation as requested.
                await new Promise(resolve => setTimeout(resolve, 800)); 
                const result = { status: 'success', message: 'Request received.' };
                // End Simulation

                if (result.status === 'success') {
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
            } finally {
                submitButton.disabled = false;
                submitButtonText.textContent = 'SUBMIT REQUEST';
                icon.className = originalIconClass;
                // Optional: Reset Turnstile on error
                if (window.turnstile) {
                    const widget = form.querySelector('.cf-turnstile')?.getAttribute('data-sitekey');
                    if (widget) window.turnstile.reset(widget);
                }
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
            // Reset Turnstile on form reset
            if (window.turnstile) {
                const widget = form.querySelector('.cf-turnstile')?.getAttribute('data-sitekey');
                if (widget) window.turnstile.reset(widget);
            }
            form.querySelector('input, select, textarea')?.focus();
        });
    }
    initConsultationForm();
});

window.addEventListener('pageshow', (event) => {
    // Hide any lingering loaders (though they are removed from HTML)
    document.getElementById('splash-loader')?.classList.add('hidden');
    document.getElementById('page-transition-loader')?.classList.add('hidden');

    document.body.classList.add('loaded'); 
    
    if (event.persisted) {
        if (typeof window.initScrollAnimations === 'function') setTimeout(window.initScrollAnimations, 100);
    }
});
