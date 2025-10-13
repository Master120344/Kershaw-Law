// index_desktop.js

// --- Utility Functions - Removed debounce ---

// --- Page Load & Initial Setup - Removed initPageLoad, initPageTransitions, initScrollAnimations, initStickyHeaderBehavior ---

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
        // Simple match for the current page file name
        if (linkTarget === currentPage) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
}

// --- Main DOM Ready and Page Load Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    initFooterYear();
    initDesktopNavActiveTab();
    // Removed initStickyHeaderBehavior
});

window.addEventListener('pageshow', (event) => {
    // Only run active tab logic if navigating back
    if (event.persisted) {
        initDesktopNavActiveTab();
    }
    // Removed all transition/opacity logic as body starts at opacity 1
});
