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

// --- Essential Page Setup Functions ---

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

function initStickyHeaderBehavior() {
    const header = document.getElementById('site-header');
    if (!header) return;

    let lastScrollTop = 0;
    const delta = 10;
    const headerHeight = header.offsetHeight;

    const handleScroll = debounce(() => {
        const nowST = window.pageYOffset || document.documentElement.scrollTop;
        if (Math.abs(lastScrollTop - nowST) <= delta) return;

        if (nowST > lastScrollTop && nowST > headerHeight * 0.5) {
            header.classList.add('scrolled-down');
        } 
        else if (nowST < lastScrollTop || nowST <= headerHeight * 0.5) {
             header.classList.remove('scrolled-down');
        }
        lastScrollTop = nowST <= 0 ? 0 : nowST;
    }, 25);

    window.addEventListener('scroll', handleScroll, { passive: true });
    if (window.pageYOffset > headerHeight * 0.5) {
        header.classList.add('scrolled-down');
    }
}

// --- Main DOM Ready Listener ---
document.addEventListener('DOMContentLoaded', () => {
    initFooterYear();
    initDesktopNavActiveTab();
    initStickyHeaderBehavior();
});
