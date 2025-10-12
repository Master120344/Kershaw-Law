// Utility debounce function with improved naming and typings
function debounce(func, wait, immediate = false) {
    let timeoutId;
    return function(...args) {
        const context = this;

        const later = () => {
            timeoutId = null;
            if (!immediate) func.apply(context, args);
        };

        const callNow = immediate && !timeoutId;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Initialize footer copyright year dynamically
function updateFooterYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Set active navigation tab based on current page URL
function setActiveNavTab() {
    const navLinks = document.querySelectorAll('.desktop-nav .nav-link');
    if (!navLinks.length) return;

    const currentPage = window.location.pathname.split('/').pop() || 'index_desktop.html';

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.remove('active');
        link.removeAttribute('aria-current');
        if (href === currentPage) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
}

// Toggle sticky header on scroll with debounce
function handleStickyHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;

    let lastScrollTop = 0;
    const delta = 10;
    const headerHeight = header.offsetHeight;

    const onScroll = debounce(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (Math.abs(lastScrollTop - scrollTop) <= delta) return;

        if (scrollTop > lastScrollTop && scrollTop > headerHeight * 0.5) {
            header.classList.add('scrolled-down');
        } else if (scrollTop < lastScrollTop || scrollTop <= headerHeight * 0.5) {
            header.classList.remove('scrolled-down');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, 25);

    window.addEventListener('scroll', onScroll, { passive: true });

    if (window.pageYOffset > headerHeight * 0.5) {
        header.classList.add('scrolled-down');
    }
}

// Initialize site behaviors on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    updateFooterYear();
    setActiveNavTab();
    handleStickyHeader();
});
