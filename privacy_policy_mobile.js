// privacy_policy_mobile.js

"use strict";
const INITIAL_SPLASH_DURATION_MS = 100;
const PAGE_TRANSITION_ANIMATION_MS = 300;

// --- Utility: Debounce function for performance
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

// --- Initial Page Load & Splash Screen Logic
function initPageLoad() {
    const splashLoader = document.querySelector('.splash-loader'); // Use querySelector for flexibility
    const bodyElement = document.body;

    if (!splashLoader || !bodyElement) {
        if(bodyElement) bodyElement.classList.add('loaded');
        return;
    }

    // This script is simple, so we can assume it loads fast.
    // We add the 'loaded' class to start the fade-in transition.
    bodyElement.classList.add('loaded');
}

// --- Page Transitions ---
function initPageTransitions() {
    const mainContent = document.querySelector('.policy-content-wrapper');
    if (!mainContent) return;

    // A simplified transition for policy pages might be better,
    // but for consistency, we'll keep the site-wide transition.
    const internalLinks = document.querySelectorAll(
        'a[href]:not([href^="#"]):not([href^="tel:"]):not([href^="mailto:"]):not([target="_blank"])'
    );

    internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const destination = link.getAttribute('href');
            // Do not animate if it's a link to the same page
            if (destination === window.location.pathname) {
                e.preventDefault();
                return;
            }
            // Animate transition
            e.preventDefault();
            document.body.style.transition = `opacity ${PAGE_TRANSITION_ANIMATION_MS / 1000}s ease-out`;
            document.body.style.opacity = '0';
            setTimeout(() => { window.location.href = destination; }, PAGE_TRANSITION_ANIMATION_MS);
        });
    });
}

// --- Dynamic Date and Year Update ---
function initDynamicDates() {
    const today = new Date();
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('en-US', dateOptions);
    const currentYear = today.getFullYear();

    const dateSpan = document.getElementById('current-date');
    if (dateSpan) {
        dateSpan.textContent = formattedDate;
    }

    const yearSpanFooter = document.getElementById('current-year-footer');
    if (yearSpanFooter) {
        yearSpanFooter.textContent = currentYear;
    }
}

// --- Main DOM Ready and Page Load Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    initPageLoad();
    initPageTransitions();
    initDynamicDates();
});

// Handle browser back/forward cache (bfcache)
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // If the page is loaded from cache, ensure it's visible
        document.body.style.transition = 'none';
        document.body.style.opacity = '1';
        setTimeout(() => {
            document.body.style.transition = `opacity ${PAGE_TRANSITION_ANIMATION_MS / 1000}s ease-out`;
        }, 50);
    }
});