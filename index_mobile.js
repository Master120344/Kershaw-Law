// index_mobile.js

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

// --- Page Load & Initial Animations ---
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

function initFooterYear() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

function initMobileNavActiveTab() {
    const mobileTabs = document.querySelectorAll('.mobile-tabs .tab-item');
    let currentPage = window.location.pathname.split('/').pop() || 'index_mobile.html';

    mobileTabs.forEach(tab => {
        const tabTarget = tab.getAttribute('href');
        tab.classList.remove('active');
        tab.removeAttribute('aria-current');
        if (tabTarget === currentPage) {
            tab.classList.add('active');
            tab.setAttribute('aria-current', 'page');
        }
    });
}

// --- NEW FUNCTION: STICKY HEADER ---
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
        } else if (nowST + window.innerHeight < document.documentElement.scrollHeight) {
            header.classList.remove('scrolled-down');
        }
        lastScrollTop = nowST <= 0 ? 0 : nowST;
    }, 25);

    window.addEventListener('scroll', handleScroll, { passive: true });
    if (window.pageYOffset <= headerHeight / 2) {
        header.classList.remove('scrolled-down');
    }
}

// --- Main DOM Ready and Page Load Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    initPageLoad();
    initPageTransitions();
    initScrollAnimations();
    initFooterYear();
    initMobileNavActiveTab();
    initStickyHeaderBehavior(); // Initialize the new header behavior
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
        initScrollAnimations();
        initMobileNavActiveTab();
    }
});