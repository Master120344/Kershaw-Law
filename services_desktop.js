// services_desktop.js

// --- Strict Mode & Global Constants ---
"use strict";
const INITIAL_SPLASH_DURATION_MS = 100;
const PAGE_TRANSITION_ANIMATION_MS = 300;

// --- Initial Page Load & Splash Screen Logic ---
function initPageLoad() {
    const splashLoader = document.getElementById('splash-loader');
    const bodyElement = document.body;
    const mainContent = document.getElementById('main-content');

    if (!splashLoader || !bodyElement || !mainContent) {
        console.warn("Essential elements for page load not found on Services page.");
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

// Scroll-triggered Animations logic removed

// Handle bfcache (Back-Forward Cache)
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
            setTimeout(() => {
                mainContent.style.transition = `opacity ${PAGE_TRANSITION_ANIMATION_MS / 1000}s ease-out`;
            }, 50);
        }
        if (typeof window.initDesktopNavActiveTab === 'function') window.initDesktopNavActiveTab();
    }
});

// --- DOMContentLoaded Event Listener ---
document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');

    // 1. Page Transition Logic
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

    // 2. Set Current Year in Footer
    function updateFooterYear() {
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    }
    updateFooterYear();

    // 3. Initialize Scroll Animations (Removed)

    // 4. Smooth Scroll for Anchors
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId.length > 1 && targetId.startsWith('#')) {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        e.preventDefault();
                        const header = document.getElementById('site-header');
                        const headerOffset = header ? header.offsetHeight : (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height-desktop').replace('px', '')) || 70);
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 20;
                        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                    }
                }
            });
        });
    }
    initSmoothScroll();

    // 5. Sticky Header Behavior (Removed logic to hide header on scroll down)

    // 6. Desktop Navigation Active State
    window.initDesktopNavActiveTab = function() {
        const desktopLinks = document.querySelectorAll('.desktop-nav .nav-link');
        if (!desktopLinks.length) return;
        let currentPage = window.location.pathname.split('/').pop() || 'index_desktop.html';
        desktopLinks.forEach(link => {
            const linkTarget = link.getAttribute('href');
            link.classList.remove('active');
            if (linkTarget === currentPage) {
                link.classList.add('active');
            }
        });
    }
    window.initDesktopNavActiveTab();

});
