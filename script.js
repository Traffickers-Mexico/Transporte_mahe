document.getElementById("year").textContent = new Date().getFullYear();

const navToggle = document.getElementById("navToggle");
const header = document.querySelector(".site-header");

navToggle.addEventListener("click", () => {
  header.classList.toggle("open");
});

document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", () => header.classList.remove("open"));
});

const toggleScrolledHeader = () => {
  header.classList.toggle("scrolled", window.scrollY > 40);
};
toggleScrolledHeader();
window.addEventListener("scroll", toggleScrolledHeader);
