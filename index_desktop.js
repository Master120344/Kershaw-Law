// Update year and highlight current nav link
document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const path = window.location.pathname.split("/").pop() || "index_desktop.html";
  document.querySelectorAll(".nav a").forEach(link => {
    if (link.getAttribute("href") === path) link.setAttribute("aria-current", "page");
  });
});
