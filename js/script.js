const menu = document.querySelector(".mobile-menu");
const navigation = document.querySelector("#navigation");

menu.addEventListener("click", () => {
    const open = navigation.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(open));
});

function changeTheme(){
    const dark = document.body.classList.toggle("dark");
    localStorage.setItem("scheme", dark ? "dark" : "light");
    theme.textContent = dark ? "☀" : "☾";
    theme.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
}

const theme = document.querySelector("#theme");
theme.addEventListener("click", changeTheme);


if(localStorage.getItem("scheme") == "dark"){
    changeTheme();
}