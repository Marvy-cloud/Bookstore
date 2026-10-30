/* =========================================================
   BOOKHAVEN — ORDER CONFIRMATION
   File: js/order-confirmation.js
========================================================= */

(() => {
    "use strict";

    const LAST_ORDER_KEY = "bookhaven-last-order";

    const card = document.getElementById("confirmation-card");
    const missing = document.getElementById("confirmation-missing");

    const formatter = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    function money(value) {
        return formatter.format(Number(value) || 0);
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function displayValue(label, value) {
        return `
      <div class="confirmation-detail-row">
        <span>${escapeHTML(label)}</span>
        <strong>${escapeHTML(value || "Not provided")}</strong>
      </div>
    `;
    }

    function render() {
        let order;

        try {
            const raw = localStorage.getItem(LAST_ORDER_KEY);
            order = raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.error("Could not read confirmation data:", error);
            order = null;
        }

        if (
            !order ||
            !order.reference ||
            !Array.isArray(order.items) ||
            !order.customer ||
            !order.delivery
        ) {
            missing.hidden = false;
            card.hidden = true;
            return;
        }

        missing.hidden = true;
        card.hidden = false;

        document.getElementById("confirmation-reference").textContent =
            order.reference;

        const date = new Date(order.createdAt);

        document.getElementById("confirmation-date").textContent =
            Number.isNaN(date.getTime())
                ? ""
                : date.toLocaleString("en-NG", {
                    dateStyle: "medium",
                    timeStyle: "short"
                });

        document.getElementById("confirmation-order-status").textContent =
            "Pending review (demo)";

        document.getElementById("confirmation-payment-status").textContent =
            "Not paid";

        document.getElementById("confirmation-items").innerHTML =
            order.items.map((item) => `
        <div class="confirmation-item">
          <div>
            <strong>${escapeHTML(item.title)}</strong>
            <span>${Number(item.quantity) || 0} × ${money(item.unitPrice)}</span>
          </div>
          <strong>${money(item.lineTotal)}</strong>
        </div>
      `).join("");

        document.getElementById("confirmation-customer").innerHTML = [
            displayValue("Full name", order.customer.name),
            displayValue("Email", order.customer.email),
            displayValue("Phone", order.customer.phone)
        ].join("");

        document.getElementById("confirmation-delivery").innerHTML = [
            displayValue("Address", order.delivery.address),
            displayValue("City", order.delivery.city),
            displayValue("State", order.delivery.state),
            displayValue("Instructions", order.delivery.notes || "None")
        ].join("");

        document.getElementById("confirmation-subtotal").textContent =
            money(order.subtotal);

        document.getElementById("current-year").textContent =
            new Date().getFullYear();
    }

    render();
})();