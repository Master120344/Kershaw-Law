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
    
    if (splashLoader) splashLoader.classList.add('hidden'); 
    bodyElement.classList.add('loaded'); 
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
    document.body.classList.add('loaded'); 
    
    if (event.persisted) {
        if (typeof window.initScrollAnimations === 'function') setTimeout(window.initScrollAnimations, 100);
    }
});


// --- DOMContentLoaded Event Listener ---
document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const header = document.getElementById('site-header');

    // 1. Footer Year
    function updateFooterYear() {
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    }
    updateFooterYear();

    // 2. Scroll Animations
    if (typeof window.initScrollAnimations === 'function') window.initScrollAnimations();

    // 3. Sticky Header Behavior
    function initStickyHeaderBehavior() {
        if (!header) return;
        let lastScrollTop = 0;
        const delta = 10;
        const headerHeight = header.offsetHeight;

        const handleScroll = debounce(() => {
            const nowST = window.pageYOffset || document.documentElement.scrollTop;
            
            if (Math.abs(lastScrollTop - nowST) <= delta) return;

            if (nowST > lastScrollTop && nowST > headerHeight) {
                 // header.classList.add('scrolled-down'); 
            } else {
                 // header.classList.remove('scrolled-down');
            }
            lastScrollTop = nowST <= 0 ? 0 : nowST;
        }, 25);
        window.addEventListener('scroll', handleScroll, { passive: true });
    }
    initStickyHeaderBehavior();


    // 4. Phone Number Formatting
    function initPhoneFormatting() {
        const phoneInput = document.getElementById('phone');
        if (!phoneInput) return;
        phoneInput.addEventListener('input', (e) => {
            const x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : `${x[1]}-${x[2]}` + (x[3] ? `-${x[3]}` : '');
        });
    }
    initPhoneFormatting();

    // 5. Consultation Form Logic
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

        function getFieldLabel(input) {
            // Helper to get the clean label text for error messages
            const labelEl = form.querySelector(`label[for="${input.id}"]`);
            if (!labelEl) return input.name;
            let text = labelEl.textContent.replace('*', '').trim();
            // Clean up any extra icon/spacing from the label
            return text.replace(/Your |Company |Primary |Approx\. /g, '').trim();
        }

        function validateInput(input) {
            input.classList.remove('input-valid', 'input-error');
            let isValid = true;
            const value = input.value.trim();
            let errorMessage = '';

            if (input.required && (!value || value === '')) {
                isValid = false;
                errorMessage = `${getFieldLabel(input)} is required.`;
            } else if (input.type === 'email' && value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
                isValid = false;
                errorMessage = `${getFieldLabel(input)} is invalid.`;
            } else if (input.type === 'tel' && input.required && value.length < 12) {
                isValid = false;
                errorMessage = `${getFieldLabel(input)} format is incomplete (XXX-XXX-XXXX).`;
            } else if (input.type === 'number' && input.required && (isNaN(value) || Number(value) < (Number(input.min) || 0))) {
                isValid = false;
                errorMessage = `${getFieldLabel(input)} must be a valid number greater than zero.`;
            }
            
            input.dataset.validationError = errorMessage;

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
            const validationResults = formInputs.map(validateInput);
            const isFormValid = validationResults.every(v => v);

            const turnstileResponse = form.querySelector('input[name="cf-turnstile-response"]')?.value;
            const isTurnstileValid = !!turnstileResponse;
            
            const errorMessages = [];
            let firstErrorElement = null;

            // 1. Collect specific form errors
            formInputs.forEach(input => {
                if (input.dataset.validationError) {
                    errorMessages.push(input.dataset.validationError);
                    if (!firstErrorElement) firstErrorElement = input;
                }
            });

            // 2. Check Turnstile error
            if (!isTurnstileValid) {
                errorMessages.push('Security Check (CAPTCHA) is required.');
                if (!firstErrorElement) firstErrorElement = form.querySelector('.cf-turnstile');
            }

            if (errorMessages.length > 0) {
                // Display detailed errors
                const errorHtml = `
                    <p>Please correct the following ${errorMessages.length} error(s) to continue:</p>
                    <ul>
                        ${errorMessages.map(msg => `<li>${msg}</li>`).join('')}
                    </ul>
                `;
                formErrorDiv.innerHTML = errorHtml;
                formErrorDiv.style.display = 'block';

                // Scroll to the first error and focus
                if (firstErrorElement) {
                    firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstErrorElement.focus();
                }
                return;
            }
            
            // Proceed with submission if valid
            formErrorDiv.style.display = 'none';
            submitButton.disabled = true;
            submitButtonText.textContent = 'Sending...';
            const icon = submitButton.querySelector('i');
            const originalIconClass = icon.className;
            icon.className = 'fas fa-spinner fa-spin';

            try {
                // Simulation of successful response
                await new Promise(resolve => setTimeout(resolve, 800)); 
                const result = { status: 'success', message: 'Request received.' };

                if (result.status === 'success') {
                    formWrapper.style.display = 'none';
                    thankYouDiv.style.display = 'block';
                    thankYouDiv.classList.add('visible');
                    thankYouDiv.focus(); 
                } else {
                    throw new Error(result.message || 'An unknown error occurred.');
                }
            } catch (error) {
                formErrorDiv.innerHTML = `
                    <p>A submission error occurred. Please try again or contact us directly:</p>
                    <ul><li>${error.message || 'A network error occurred. Please try again.'}</li></ul>
                `;
                formErrorDiv.style.display = 'block';
            } finally {
                submitButton.disabled = false;
                submitButtonText.textContent = 'SUBMIT REQUEST';
                icon.className = originalIconClass;
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
                delete input.dataset.validationError;
            });
            formErrorDiv.style.display = 'none';
            if (window.turnstile) {
                const widget = form.querySelector('.cf-turnstile')?.getAttribute('data-sitekey');
                if (widget) window.turnstile.reset(widget);
            }
            form.querySelector('input, select, textarea')?.focus();
        });
    }
    initConsultationForm();
});
