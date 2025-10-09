// sitemap_mobile.js

// --- Strict Mode & Global Constants ---
"use strict";
const INITIAL_SPLASH_DURATION_MS = 100;
const PAGE_TRANSITION_ANIMATION_MS = 300;

// --- Utility Functions ---
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

// --- Initial Page Load & Splash Screen Logic ---
function initPageLoad() {
    const splashLoader = document.getElementById('splash-loader');
    const bodyElement = document.body;
    const mainContent = document.getElementById('main-content');

    if (!splashLoader || !bodyElement || !mainContent) {
        if (bodyElement) bodyElement.classList.add('loaded');
        if (mainContent) mainContent.style.visibility = 'visible';
        return;
    }

    if (bodyElement.classList.contains('loaded')) {
        mainContent.style.visibility = 'visible';
        return;
    }
    
    mainContent.style.visibility = 'hidden';
    document.documentElement.style.setProperty('--loader-display-duration', `${INITIAL_SPLASH_DURATION_MS / 1000}s`);

    setTimeout(() => {
        splashLoader.classList.add('hidden');
        mainContent.style.visibility = 'visible';
        mainContent.style.transition = `opacity ${PAGE_TRANSITION_ANIMATION_MS / 1000}s ease-out`;
        mainContent.style.opacity = '1';
        bodyElement.classList.add('loaded');
    }, INITIAL_SPLASH_DURATION_MS);
}

// --- Scroll-triggered Animations ---
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (!animatedElements.length || !('IntersectionObserver' in window)) return;

    animatedElements.forEach(el => el.classList.remove('is-visible'));

    const observer = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.dataset.animationDelay) || 0;
                setTimeout(() => {
                    entry.target.classList.add('is-visible');
                }, delay);
                observerInstance.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

    animatedElements.forEach(el => observer.observe(el));
}

// --- Page Transitions ---
function initPageTransitions() {
    const transitionLoader = document.getElementById('page-transition-loader');
    const mainContent = document.getElementById('main-content');
    if (!transitionLoader || !mainContent) return;

    const internalLinks = document.querySelectorAll(
        'a[href]:not([href^="#"]):not([href^="tel:"]):not([href^="mailto:"]):not([href^="javascript:"]):not([target="_blank"])'
    );

    internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const dest = link.getAttribute('href');
            if (!dest) return;
            
            e.preventDefault();
            mainContent.style.transition = `opacity 0.25s ease-out`;
            mainContent.style.opacity = '0';
            transitionLoader.classList.remove('hidden');
            setTimeout(() => { window.location.href = dest; }, PAGE_TRANSITION_ANIMATION_MS);
        });
    });
}

// --- Sticky Header Behavior ---
function initStickyHeaderBehavior() {
    const header = document.getElementById('site-header');
    if (!header) return;

    let lastScrollTop = 0;
    const delta = 5;
    const headerHeight = header.offsetHeight;

    const handleScroll = debounce(() => {
        const nowST = window.pageYOffset || document.documentElement.scrollTop;
        if (Math.abs(lastScrollTop - nowST) <= delta) return;

        if (nowST > lastScrollTop && nowST > headerHeight) {
            header.classList.add('scrolled-down');
        } else {
            header.classList.remove('scrolled-down');
        }
        lastScrollTop = nowST <= 0 ? 0 : nowST;
    }, 25);

    window.addEventListener('scroll', handleScroll, { passive: true });
}

// --- Footer Year ---
function initFooterYear() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

// --- Main DOM Ready and Page Load Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    initPageLoad();
    initScrollAnimations();
    initPageTransitions();
    initStickyHeaderBehavior();
    initFooterYear();
});

window.addEventListener('pageshow', (event) => {
    const transitionLoader = document.getElementById('page-transition-loader');
    if (transitionLoader) transitionLoader.classList.add('hidden');
    
    if (event.persisted) {
        const mainContent = document.getElementById('main-content');
        if(mainContent) {
            mainContent.style.transition = 'none';
            mainContent.style.opacity = '1';
        }
        initScrollAnimations();
    }
});