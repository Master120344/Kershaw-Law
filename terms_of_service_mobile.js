// terms_of_service_mobile.js
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    // Update the Footer Year
    const yearSpanFooter = document.getElementById('current-year-footer');
    if (yearSpanFooter) {
        yearSpanFooter.textContent = today.getFullYear();
    }
});