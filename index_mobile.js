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

document.addEventListener('DOMContentLoaded', () => {
    initFooterYear();
    initMobileNavActiveTab();
});

window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        initMobileNavActiveTab();
    }
});
