// aboutus_desktop.js

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

// --- Page Load & Initial Animations (Splash only) ---
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
    const splashDuration = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--loader-display-duration')) || 0.1) * 1000;

    setTimeout(() => {
        splashLoader.classList.add('hidden');
        mainContent.style.visibility = 'visible';
        bodyElement.classList.add('loaded');
    }, splashDuration);
}

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

            const currentPath = window.location.pathname.replace(/\/$/, "");
            const destPathObj = new URL(dest, window.location.href);
            const destPath = destPathObj.pathname.replace(/\/$/, "");

            if (destPath === currentPath && !destPathObj.hash) {
                e.preventDefault();
                return;
            }

            e.preventDefault();
            mainContent.style.transition = `opacity 0.25s ease-out`;
            mainContent.style.opacity = '0';
            transitionLoader.classList.remove('hidden');
            setTimeout(() => { window.location.href = dest; }, 300);
        });
    });
}

// Removed initScrollAnimations function

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
        if (linkTarget === currentPage) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
}

// Removed initStickyHeaderBehavior function

// --- Main DOM Ready and Page Load Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    initPageLoad();
    initPageTransitions();
    // initScrollAnimations removed
    initFooterYear();
    initDesktopNavActiveTab();
    // initStickyHeaderBehavior removed
});

window.addEventListener('pageshow', (event) => {
    const transitionLoader = document.getElementById('page-transition-loader');
    if (transitionLoader) transitionLoader.classList.add('hidden');
    
    document.body.style.opacity = '1';
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.style.transition = 'none';
        mainContent.style.opacity = '1';
        mainContent.style.visibility = 'visible';
    }

    if (event.persisted) {
        // initScrollAnimations removed
        initDesktopNavActiveTab();
    }
});
