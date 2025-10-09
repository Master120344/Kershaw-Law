// terms_of_service_mobile.js
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('en-US', options);
    
    // Update the Effective Date
    const dateSpan = document.getElementById('effective-date');
    if (dateSpan) {
        dateSpan.textContent = formattedDate;
    }
    
    // Update the Footer Year
    const yearSpanFooter = document.getElementById('current-year-footer');
    if (yearSpanFooter) {
        yearSpanFooter.textContent = today.getFullYear();
    }
});