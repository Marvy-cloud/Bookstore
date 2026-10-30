/* =========================================================
   BOOKHAVEN — CONTACT FORM
   File: js/contact.js

   Frontend demonstration only.
   Messages are not emailed or transmitted to a server.
========================================================= */

(() => {
    "use strict";

    const form = document.getElementById("contact-form");
    const feedback = document.getElementById("contact-feedback");
    const messageField = document.getElementById("contact-message");
    const messageCount = document.getElementById("message-count");
    const submitButton = document.getElementById("contact-submit");
    const currentYear = document.getElementById("current-year");

    if (!form || !feedback || !messageField || !submitButton) {
        return;
    }

    let feedbackTimer;
    let submitting = false;

    function showFeedback(message, type = "success") {
        window.clearTimeout(feedbackTimer);

        feedback.textContent = message;
        feedback.className = `contact-feedback is-${type}`;
        feedback.hidden = false;

        feedback.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

        feedbackTimer = window.setTimeout(() => {
            feedback.hidden = true;
        }, 7000);
    }

    function updateCharacterCount() {
        const length = messageField.value.length;
        const maximum = Number(messageField.maxLength) || 3000;

        messageCount.textContent = `${length} / ${maximum} characters`;

        messageCount.classList.toggle(
            "is-near-limit",
            length >= maximum * 0.9
        );
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (submitting) return;

        feedback.hidden = true;

        if (!form.reportValidity()) return;

        const formData = new FormData(form);

        const message = {
            name: String(formData.get("name") || "").trim(),
            email: String(formData.get("email") || "").trim(),
            topic: String(formData.get("topic") || "").trim(),
            subject: String(formData.get("subject") || "").trim(),
            message: String(formData.get("message") || "").trim(),
            consent: document.getElementById("contact-consent").checked
        };

        if (
            message.name.length < 2 ||
            message.email.length === 0 ||
            message.topic.length === 0 ||
            message.subject.length < 3 ||
            message.message.length < 10
        ) {
            showFeedback(
                "Please review the required fields and try again.",
                "error"
            );
            return;
        }

        if (!message.consent) {
            showFeedback(
                "Please confirm that your details may be used to respond to your enquiry.",
                "error"
            );
            return;
        }

        /*
          No fetch request is made here because the project does not yet
          have a contact endpoint. This is an honest frontend-only demo.
        */

        submitting = true;
        submitButton.disabled = true;

        showFeedback(
            "Your form passed validation, but your message has not been sent. Connect a backend or form service to deliver it.",
            "demo"
        );

        // Allow another test submission without implying delivery.
        window.setTimeout(() => {
            submitting = false;
            submitButton.disabled = false;
        }, 1200);
    }

    messageField.addEventListener("input", updateCharacterCount);
    form.addEventListener("submit", handleSubmit);

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    updateCharacterCount();
})();