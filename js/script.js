document.documentElement.classList.add("js");

const menuToggle = document.querySelector(".site-menu-toggle");
const siteNavigation = document.querySelector("#site-navigation");

function setNavigationOpen(open) {
    siteNavigation.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    menuToggle.querySelector(".site-menu-label").textContent = open ? "Close" : "Menu";
    menuToggle.querySelector('[aria-hidden="true"]').textContent = open ? "×" : "☰";
}

menuToggle.addEventListener("click", () => {
    setNavigationOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});

siteNavigation.addEventListener("click", event => {
    if (event.target.closest("a")) {
        setNavigationOpen(false);
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
        setNavigationOpen(false);
        menuToggle.focus();
    }
});

const themeToggle = document.querySelector(".site-theme-toggle");
themeToggle.addEventListener("click", () => {
    const dark = document.body.classList.toggle("dark");
    themeToggle.setAttribute("aria-pressed", String(dark));
    themeToggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    themeToggle.querySelector('[aria-hidden="true"]').textContent = dark ? "☀" : "☾";
});