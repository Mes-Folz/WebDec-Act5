const form = document.querySelector("#contact-form");
const formFeedback = document.querySelector("#form-feedback");
const fields = [
    "firstname",
    "lastname",
    "age",
    "password",
    "email",
    "number",
    "visit-date",
    "visit-time",
    "message"
].map(id => form.querySelector("#" + id));
const inquiryInputs = Array.from(form.querySelectorAll('input[name="inquiry"]'));
const inquiryFieldset = inquiryInputs[0].closest("fieldset");
const inquiryError = form.querySelector("#inquiry-error");
const phonePattern = /^(?:09\d{9}|\+639\d{9})$/;

form.noValidate = true;

function getFieldError(field) {
    const value = field.value.trim();

    if (field.required && !value) {
        const labels = {
            firstname: "first name",
            lastname: "last name",
            email: "email address",
            message: "message"
        };
        return "Please enter your " + labels[field.id] + ".";
    }

    if ((field.id === "firstname" || field.id === "lastname") && value.length < 2) {
        return "Please enter at least 2 characters.";
    }

    if (field.id === "age" && (field.validity.badInput || value && !field.validity.valid)) {
        return "Enter an age from 13 to 120.";
    }

    if (field.id === "password" && value && value.length < 8) {
        return "Use at least 8 characters, or leave this demo-only field blank.";
    }

    if (field.type === "email" && field.validity.typeMismatch) {
        return "Enter an email address in a format like name@example.com.";
    }

    if (field.id === "number" && value && !phonePattern.test(value.replace(/[\s()-]/g, ""))) {
        return "Enter a Philippine mobile number, such as 0930 407 7838.";
    }

    if (field.id === "message" && value.length < 10) {
        return "Please enter at least 10 characters in your message.";
    }

    return "";
}

function showFieldError(field) {
    const message = getFieldError(field);
    const error = form.querySelector("#" + field.id + "-error");
    error.textContent = message;
    error.hidden = !message;

    if (message) {
        field.setAttribute("aria-invalid", "true");
    } else {
        field.removeAttribute("aria-invalid");
    }

    return message;
}

function validateInquiry() {
    const message = inquiryInputs.some(input => input.checked)
        ? ""
        : "Select at least one inquiry type.";
    inquiryError.textContent = message;
    inquiryError.hidden = !message;

    if (message) {
        inquiryFieldset.setAttribute("aria-invalid", "true");
    } else {
        inquiryFieldset.removeAttribute("aria-invalid");
    }

    return message;
}

function setFeedback(message, success = false) {
    formFeedback.replaceChildren();

    if (success) {
        const icon = document.createElement("img");
        icon.src = "./Images/contact/success-leaf.svg";
        icon.alt = "";
        formFeedback.append(icon);
    }

    formFeedback.append(document.createTextNode(message));
}

form.addEventListener("submit", event => {
    event.preventDefault();
    const invalidFields = fields.filter(showFieldError);
    const inquiryMessage = validateInquiry();

    if (invalidFields.length || inquiryMessage) {
        setFeedback("Please correct the highlighted fields before continuing.");
        if (invalidFields.length) {
            invalidFields[0].focus();
        } else {
            inquiryInputs[0].focus();
        }
        return;
    }

    setFeedback(
        "Demo check passed. Nothing was sent or saved. For a real inquiry, call or email the cafe.",
        true
    );
});

form.addEventListener("input", event => {
    const field = event.target;
    if (fields.includes(field)) {
        showFieldError(field);
        setFeedback("");
    }
});

form.addEventListener("change", event => {
    const field = event.target;
    if (fields.includes(field)) {
        showFieldError(field);
        setFeedback("");
    }

    if (inquiryInputs.includes(field)) {
        validateInquiry();
        setFeedback("");
    }
});

form.addEventListener("reset", () => {
    window.setTimeout(() => {
        fields.forEach(field => {
            const error = form.querySelector("#" + field.id + "-error");
            error.textContent = "";
            error.hidden = true;
            field.removeAttribute("aria-invalid");
        });
        inquiryError.textContent = "";
        inquiryError.hidden = true;
        inquiryFieldset.removeAttribute("aria-invalid");
        setFeedback("Demo form only; nothing is sent or saved.", true);
    }, 0);
});
