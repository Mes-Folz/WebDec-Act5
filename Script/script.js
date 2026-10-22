function changeScheme(val){
    document.body.classList.toggle("darkMode");
    localStorage.setItem("scheme", val);
}

function toggleSchemeMode(){
    if(document.body.classList.contains("darkMode"))
        changeScheme("lightMode");
    else
        changeScheme("darkMode");
}

if(localStorage.getItem("scheme") == "darkMode")
    changeScheme("darkMode");