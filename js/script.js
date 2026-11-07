const menu = document.querySelector(".mobile-menu");
const navigation = document.querySelector("#navigation");

menu.addEventListener("click", () => {
    const open = navigation.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(open));
});

const theme = document.querySelector("#theme");
theme.addEventListener("click", () => {
    const dark = document.body.classList.toggle("dark");
    theme.textContent = dark ? "☀" : "☾";
    theme.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
});