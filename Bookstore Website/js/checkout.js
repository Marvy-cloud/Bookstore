//    FRONTEND PROTOTYPE ONLY:
//    Orders are stored in this browser's localStorage.
//    Do not use this as a production order or payment system.
// ========================================================= */

(() => {
  "use strict";

  const CART_KEY = "bookhaven-cart";
  const ORDERS_KEY = "bookhaven-orders";
  const LAST_ORDER_KEY = "bookhaven-last-order";

  const form = document.getElementById("checkout-form");
  const content = document.getElementById("checkout-content");
  const emptyState = document.getElementById("checkout-empty");
  const errorBox = document.getElementById("checkout-error");
  const itemsContainer = document.getElementById("checkout-order-items");
  const subtotalElement = document.getElementById("checkout-subtotal");
  const totalElement = document.getElementById("checkout-total");
  const submitButton = document.getElementById("place-order-button");
  const cartBadge = document.getElementById("cart-count");
  const currentYear = document.getElementById("current-year");

  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  let checkoutItems = [];
  let checkoutSubtotal = 0;
  let submitting = false;

  function money(amount) {
    return formatter.format(amount);
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

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
    errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function getBookData() {
    const books = window.BookHaven?.books;

    if (!Array.isArray(books)) {
      throw new Error("Book catalogue could not be loaded. Please refresh.");
    }

    return books;
  }

  function readCart() {
    const raw = localStorage.getItem(CART_KEY);

    if (!raw) return [];

    const cart = JSON.parse(raw);

    if (!Array.isArray(cart)) {
      throw new Error("Your cart data is invalid. Return to your cart and try again.");
    }

    return cart;
  }

  function getPrice(book) {
    const price = Number(book.price);

    if (!Number.isFinite(price) || price < 0) {
      throw new Error(`The price for "${book.title}" is invalid.`);
    }

    return price;
  }

  function buildCheckoutItems() {
    const books = getBookData();
    const cart = readCart();

    return cart.map((item) => {
      const book = books.find(
        (entry) => String(entry.id) === String(item.id)
      );

      if (!book) {
        throw new Error("A book in your cart is no longer available.");
      }

      const quantity = Math.floor(Number(item.quantity));

      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        throw new Error("One of your book quantities is invalid.");
      }

      const unitPrice = getPrice(book);

      return {
        id: String(book.id),
        title: String(book.title),
        author: String(book.author || "Unknown author"),
        image: String(book.image || ""),
        quantity,
        unitPrice,
        lineTotal: unitPrice * quantity
      };
    });
  }

  function renderOrderSummary() {
    checkoutItems = buildCheckoutItems();

    if (checkoutItems.length === 0) {
      content.hidden = true;
      emptyState.hidden = false;
      cartBadge.textContent = "0";
      return;
    }

    emptyState.hidden = true;
    content.hidden = false;

    checkoutSubtotal = checkoutItems.reduce(
      (sum, item) => sum + item.lineTotal,
      0
    );

    itemsContainer.innerHTML = checkoutItems.map((item) => `
      <div class="checkout-order-item">
        <div class="checkout-order-image-wrap">
          <img
            src="${escapeHTML(item.image)}"
            alt="${escapeHTML(item.title)}"
            class="checkout-order-image"
          >
          <span class="checkout-order-quantity">${item.quantity}</span>
        </div>

        <div class="checkout-order-book">
          <h3>${escapeHTML(item.title)}</h3>
          <p>${escapeHTML(item.author)}</p>
          <span>${money(item.unitPrice)} each</span>
        </div>

        <strong class="checkout-order-line-total">
          ${money(item.lineTotal)}
        </strong>
      </div>
    `).join("");

    subtotalElement.textContent = money(checkoutSubtotal);
    totalElement.textContent = money(checkoutSubtotal);

    const count = checkoutItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    cartBadge.textContent = count;
  }

  function generateOrderReference() {
    // This is a demo reference, not a secure or globally unique ID.
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 7).toUpperCase();

    return `BH-${timestamp}-${random}`;
  }

  function getStoredOrders() {
    const raw = localStorage.getItem(ORDERS_KEY);

    if (!raw) return [];

    const orders = JSON.parse(raw);

    if (!Array.isArray(orders)) {
      throw new Error("Saved order data is invalid.");
    }

    return orders;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;

    errorBox.hidden = true;

    if (!form.reportValidity()) return;

    const formData = new FormData(form);

    try {
      // Rebuild from current catalogue data immediately before submission.
      renderOrderSummary();

      if (checkoutItems.length === 0) {
        showError("Your cart is empty. Add books before submitting an order.");
        return;
      }

      const customer = {
        name: String(formData.get("customerName") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        phone: String(formData.get("phone") || "").trim()
      };

      const delivery = {
        address: String(formData.get("address") || "").trim(),
        city: String(formData.get("city") || "").trim(),
        state: String(formData.get("state") || "").trim(),
        notes: String(formData.get("notes") || "").trim()
      };

      if (
        !customer.name ||
        !customer.email ||
        !customer.phone ||
        !delivery.address ||
        !delivery.city ||
        !delivery.state
      ) {
        showError("Please complete all required contact and delivery fields.");
        return;
      }

      const confirmed = document.getElementById("confirm-details").checked;

      if (!confirmed) {
        showError("Please confirm that your details are correct.");
        return;
      }

      const cartSnapshot = JSON.stringify(readCart());

      const order = {
        reference: generateOrderReference(),
        createdAt: new Date().toISOString(),
        status: "pending_review",
        paymentStatus: "not_paid",
        currency: "NGN",
        customer,
        delivery,
        items: checkoutItems.map((item) => ({ ...item })),
        subtotal: checkoutSubtotal,
        deliveryFee: null,
        totalBeforeDelivery: checkoutSubtotal
      };

      // Prototype storage only; this is not a server-side order record.
      const orders = getStoredOrders();
      orders.push(order);

      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));

      // Avoid clearing a cart that changed in another tab during submission.
      if (localStorage.getItem(CART_KEY) === cartSnapshot) {
        localStorage.removeItem(CART_KEY);
      }

      submitting = true;
      submitButton.disabled = true;

      window.location.href = "order-confirmation.html";
    } catch (error) {
      console.error("BookHaven checkout error:", error);
      showError(
        error.message ||
        "We could not prepare your order. Please review your cart and try again."
      );
    }
  }

  form.addEventListener("submit", handleSubmit);

  window.addEventListener("storage", (event) => {
    if (event.key === CART_KEY) {
      try {
        renderOrderSummary();
      } catch (error) {
        showError(error.message || "Unable to refresh your cart.");
      }
    }
  });

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  try {
    renderOrderSummary();
  } catch (error) {
    console.error("Unable to load checkout:", error);
    showError(error.message || "Unable to load checkout.");
    content.hidden = true;
  }
})();