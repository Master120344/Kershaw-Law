"use strict";
const INITIAL_SPLASH_DURATION_MS = 100;
const PAGE_TRANSITION_ANIMATION_MS = 250;
const PHP_SCRIPT_URL = 'send_email.php';

function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

function initPageLoad() {
    const splashLoader = document.getElementById('splash-loader');
    const bodyElement = document.body;
    const mainContent = document.getElementById('main-content');

    if (!splashLoader || !bodyElement || !mainContent) {
        if (bodyElement) bodyElement.classList.add('loaded');
        if (mainContent) {
             mainContent.style.visibility = 'visible';
             mainContent.style.opacity = '1';
        }
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
    const observerOptions = { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 };
    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.dataset.animationDelay) || 0;
                setTimeout(() => entry.target.classList.add('is-visible'), delay);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    animatedElements.forEach(el => {
        if (!el.classList.contains('is-visible')) animationObserver.observe(el);
    });
};

window.addEventListener('pageshow', (event) => {
    const pageTransitionLoader = document.getElementById('page-transition-loader');
    if (pageTransitionLoader) pageTransitionLoader.classList.add('hidden');

    if (event.persisted) {
        document.body.classList.add('loaded');
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.style.transition = 'none';
            mainContent.style.opacity = '1';
            mainContent.style.visibility = 'visible';
        }
        if (typeof window.initScrollAnimations === 'function') setTimeout(window.initScrollAnimations, 100);
        if (typeof window.initDesktopNavActiveTab === 'function') window.initDesktopNavActiveTab();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');

    function initPageTransitions() {
        const transitionLoader = document.getElementById('page-transition-loader');
        if (!transitionLoader || !mainContent) return;
        const internalLinks = document.querySelectorAll(
            'a[href]:not([href^="#"]):not([href^="tel:"]):not([href^="mailto:"]):not([href^="javascript:"]):not([target="_blank"])'
        );
        internalLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const dest = link.getAttribute('href');
                if (!dest) return;
                const curPath = window.location.pathname.replace(/\/$/, "");
                const destPathObj = new URL(dest, window.location.href);
                const destPath = destPathObj.pathname.replace(/\/$/, "");
                if (destPath === curPath && !destPathObj.hash) { e.preventDefault(); return; }

                e.preventDefault();
                mainContent.style.opacity = '0';
                transitionLoader.classList.remove('hidden');
                setTimeout(() => { window.location.href = dest; }, PAGE_TRANSITION_ANIMATION_MS + 50);
            });
        });
    }
    initPageTransitions();

    function updateFooterYear() {
        document.getElementById('current-year').textContent = new Date().getFullYear();
    }
    updateFooterYear();

    if (typeof window.initScrollAnimations === 'function') window.initScrollAnimations();

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId.length > 1) {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        e.preventDefault();
                        const headerOffset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height-desktop').replace('px', '')) || 70;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 20;
                        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                    }
                }
            });
        });
    }
    initSmoothScroll();

    function initPhoneFormatting() {
        const phoneInput = document.getElementById('contact-phone');
        if (!phoneInput) return;
        phoneInput.addEventListener('input', (e) => {
            let input = e.target.value.replace(/\D/g, '');
            let formattedInput = '';
            if (input.length > 0) formattedInput = input.substring(0, 3);
            if (input.length > 3) formattedInput += '-' + input.substring(3, 6);
            if (input.length > 6) formattedInput += '-' + input.substring(6, 10);
            e.target.value = formattedInput;
        });
    }
    initPhoneFormatting();

    window.initDesktopNavActiveTab = function() {
        const desktopLinks = document.querySelectorAll('.desktop-nav .nav-link');
        if (!desktopLinks.length) return;
        let currentPage = window.location.pathname.split('/').pop() || 'index_desktop.html';
        desktopLinks.forEach(link => {
            const linkTarget = link.getAttribute('href');
            link.classList.remove('active');
            if (linkTarget === currentPage) link.classList.add('active');
        });
    }
    window.initDesktopNavActiveTab();
    
    function initContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) { console.warn('Contact form not found.'); return; }

        const thankYouMessageDiv = document.getElementById('thank-you-message');
        const userNameSpan = document.getElementById('thank-you-user-name');
        const nameInput = document.getElementById('contact-name');
        const resetButton = document.getElementById('reset-form-button');
        const submitButton = document.getElementById('form-submit-button');
        const submitButtonTextSpan = submitButton.querySelector('.submit-button-text');
        const formErrorMessageDiv = document.getElementById('form-error-message');
        const thankYouBackendMessage = document.getElementById('thank-you-backend-message');
        const messageTextarea = document.getElementById('contact-message');
        const charCountDisplay = document.getElementById('message-char-count');
        
        const maxLength = parseInt(messageTextarea.getAttribute('maxlength'), 10);
        messageTextarea.addEventListener('input', () => {
            const currentLength = messageTextarea.value.length;
            charCountDisplay.textContent = `${currentLength}/${maxLength}`;
        });

        function liveValidateInput(input) {
            input.classList.remove('input-error', 'input-valid');
            let isValid = input.checkValidity();
            if (input.tagName === 'TEXTAREA' && input.value.length > input.maxLength) isValid = false;
            
            if (input.dataset.touched === "true" || form.dataset.submitted === "true") {
                if (isValid && input.value.trim()) input.classList.add('input-valid');
                else if (!isValid) input.classList.add('input-error');
            }
        }
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => { input.dataset.touched = "true"; liveValidateInput(input); });
            input.addEventListener('input', () => liveValidateInput(input));
        });

        form.addEventListener('submit', async function(event) {
            event.preventDefault();
            form.dataset.submitted = "true";
            formErrorMessageDiv.style.display = 'none';
            formErrorMessageDiv.textContent = '';

            let isFormFullyValid = true;
            inputs.forEach(input => {
                liveValidateInput(input);
                if (!input.checkValidity()) isFormFullyValid = false;
            });
            if (messageTextarea.value.length > maxLength) isFormFullyValid = false;
            
            if (!isFormFullyValid) {
                formErrorMessageDiv.textContent = 'Please fill out all highlighted required fields correctly.';
                formErrorMessageDiv.style.display = 'block';
                form.querySelector('.input-error, :invalid')?.focus();
                delete form.dataset.submitted;
                return;
            }

            submitButton.disabled = true;
            submitButtonTextSpan.textContent = 'Sending...';
            const originalIconClass = submitButton.querySelector('i').className;
            submitButton.querySelector('i').className = 'fas fa-spinner fa-spin';

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(PHP_SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                
                if (response.ok && result.status === 'success') {
                    userNameSpan.textContent = nameInput.value.trim().split(' ')[0] || "Valued Client";
                    thankYouBackendMessage.textContent = result.message || 'Your message has been sent.';
                    form.style.display = 'none';
                    thankYouMessageDiv.style.display = 'block';
                    setTimeout(() => thankYouMessageDiv.classList.add('visible'), 10);
                    thankYouMessageDiv.focus();
                } else {
                    formErrorMessageDiv.textContent = result.message || 'An unexpected error occurred.';
                    formErrorMessageDiv.style.display = 'block';
                }
            } catch (error) {
                formErrorMessageDiv.textContent = 'A network error occurred. Please try again.';
                formErrorMessageDiv.style.display = 'block';
            } finally {
                submitButton.disabled = false;
                submitButtonTextSpan.textContent = 'Send Inquiry';
                submitButton.querySelector('i').className = originalIconClass;
                delete form.dataset.submitted;
            }
        });

        resetButton.addEventListener('click', () => {
            thankYouMessageDiv.classList.remove('visible');
            setTimeout(() => {
                thankYouMessageDiv.style.display = 'none';
                form.style.display = 'block';
                form.reset();
                inputs.forEach(el => {
                    el.classList.remove('input-error', 'input-valid');
                    delete el.dataset.touched;
                });
                delete form.dataset.submitted;
                charCountDisplay.textContent = `0/${maxLength}`;
                formErrorMessageDiv.style.display = 'none';
                nameInput.focus();
            }, 300);
        });
    }
    initContactForm();

});
