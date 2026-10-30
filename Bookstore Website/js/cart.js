
/* =========================================================
   BOOKHAVEN — SHOPPING CART
   File: js/cart.js
========================================================= */

(() => {
    "use strict";

    const CART_KEY = "bookhaven-cart";
    const CURRENCY = "NGN";

    const elements = {
        loading: document.getElementById("cart-loading"),
        content: document.getElementById("cart-content"),
        empty: document.getElementById("cart-empty"),
        error: document.getElementById("cart-error"),
        errorMessage: document.getElementById("cart-error-message"),
        retry: document.getElementById("retry-cart"),
        items: document.getElementById("cart-items"),
        itemCount: document.getElementById("cart-item-count"),
        summaryQuantity: document.getElementById("summary-quantity"),
        subtotal: document.getElementById("cart-subtotal"),
        total: document.getElementById("cart-total"),
        cartCount: document.getElementById("cart-count"),
        feedback: document.getElementById("cart-feedback"),
        checkout: document.getElementById("checkout-button"),
        currentYear: document.getElementById("current-year")
    };

    const moneyFormatter = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: CURRENCY,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    let feedbackTimer;

    function getBooks() {
        const books = window.BookHaven?.books;

        if (!Array.isArray(books)) {
            throw new Error(
                "Book data was not found. Check that js/data.js loads correctly."
            );
        }

        return books;
    }

    function getCart() {
        const storedCart = localStorage.getItem(CART_KEY);

        if (!storedCart) {
            return [];
        }

        const parsedCart = JSON.parse(storedCart);

        if (!Array.isArray(parsedCart)) {
            throw new Error("Your saved cart has an invalid format.");
        }

        return parsedCart
            .filter((item) => item && item.id != null)
            .map((item) => ({
                id: String(item.id),
                quantity: Math.min(
                    99,
                    Math.max(1, Math.floor(Number(item.quantity) || 1))
                )
            }));
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    function formatMoney(amount) {
        return moneyFormatter.format(amount);
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, (character) => {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return entities[character];
        });
    }

    function getBookById(id, books) {
        return books.find((book) => String(book.id) === String(id));
    }

    function getValidPrice(book) {
        const price = Number(book.price);

        if (!Number.isFinite(price) || price < 0) {
            return 0;
        }

        return price;
    }

    function updateCartBadge(cart) {
        const count = cart.reduce(
            (total, item) => total + item.quantity,
            0
        );

        // Update this page's badge.
        if (elements.cartCount) {
            elements.cartCount.textContent = count;
        }

        // Also update other cart-count badges, if any exist on this page.
        document.querySelectorAll(".cart-count").forEach((badge) => {
            badge.textContent = count;
        });
    }

    function showState(state) {
        elements.loading.hidden = state !== "loading";
        elements.content.hidden = state !== "content";
        elements.empty.hidden = state !== "empty";
        elements.error.hidden = state !== "error";
    }

    function showFeedback(message) {
        elements.feedback.textContent = message;
        elements.feedback.hidden = false;

        window.clearTimeout(feedbackTimer);

        feedbackTimer = window.setTimeout(() => {
            elements.feedback.hidden = true;
        }, 3000);
    }

    function createCartItem(book, cartItem) {
        const price = getValidPrice(book);
        const quantity = cartItem.quantity;
        const lineTotal = price * quantity;
        const title = escapeHTML(book.title);
        const author = escapeHTML(book.author || "Unknown author");
        const category = escapeHTML(book.category || "Book");
        const image = escapeHTML(book.image || "");
        const id = escapeHTML(book.id);

        return `
      <article class="cart-item" data-cart-item="${id}">
        <a
          href="book-details.html?id=${encodeURIComponent(book.id)}"
          class="cart-item-cover-link"
          aria-label="View ${title}"
        >
          <img
            class="cart-item-cover"
            src="${image}"
            alt="Cover of ${title}"
            loading="lazy"
          >
        </a>

        <div class="cart-item-details">
          <span class="cart-item-category">${category}</span>

          <h3 class="cart-item-title">
            <a href="book-details.html?id=${encodeURIComponent(book.id)}">
              ${title}
            </a>
          </h3>

          <p class="cart-item-author">by ${author}</p>

          <p class="cart-item-unit-price">
            ${formatMoney(price)} <span>each</span>
          </p>

          <button
            type="button"
            class="cart-remove-button"
            data-cart-action="remove"
            data-book-id="${id}"
            aria-label="Remove ${title} from cart"
          >
            <i class="fa-regular fa-trash-can" aria-hidden="true"></i>
            Remove
          </button>
        </div>

        <div class="cart-item-actions">
          <label class="quantity-label" for="quantity-${id}">
            Quantity
          </label>

          <div class="cart-quantity-control">
            <button
              type="button"
              data-cart-action="decrease"
              data-book-id="${id}"
              aria-label="Decrease quantity of ${title}"
              ${quantity <= 1 ? "disabled" : ""}
            >
              <i class="fa-solid fa-minus" aria-hidden="true"></i>
            </button>

            <input
              id="quantity-${id}"
              type="number"
              min="1"
              max="99"
              step="1"
              value="${quantity}"
              data-cart-quantity="${id}"
              aria-label="Quantity of ${title}"
            >

            <button
              type="button"
              data-cart-action="increase"
              data-book-id="${id}"
              aria-label="Increase quantity of ${title}"
              ${quantity >= 99 ? "disabled" : ""}
            >
              <i class="fa-solid fa-plus" aria-hidden="true"></i>
            </button>
          </div>

          <p class="cart-line-total">
            <span>Subtotal</span>
            <strong>${formatMoney(lineTotal)}</strong>
          </p>
        </div>
      </article>
    `;
    }

    function renderCart() {
        showState("loading");

        try {
            const books = getBooks();
            let cart = getCart();

            // Remove cart entries whose books no longer exist in the catalogue.
            const validCart = cart.filter((item) =>
                getBookById(item.id, books)
            );

            if (validCart.length !== cart.length) {
                cart = validCart;
                saveCart(cart);
            }

            updateCartBadge(cart);

            if (cart.length === 0) {
                elements.items.innerHTML = "";
                elements.itemCount.textContent = "0 items";
                elements.summaryQuantity.textContent = "0";
                elements.subtotal.textContent = formatMoney(0);
                elements.total.textContent = formatMoney(0);


                showState("empty");
                return;
            }

            let totalQuantity = 0;
            let subtotal = 0;

            elements.items.innerHTML = cart
                .map((item) => {
                    const book = getBookById(item.id, books);
                    const price = getValidPrice(book);

                    totalQuantity += item.quantity;
                    subtotal += price * item.quantity;

                    return createCartItem(book, item);
                })
                .join("");

            elements.itemCount.textContent =
                `${cart.length} ${cart.length === 1 ? "book" : "different books"}`;

            elements.summaryQuantity.textContent = totalQuantity;
            elements.subtotal.textContent = formatMoney(subtotal);
            elements.total.textContent = formatMoney(subtotal);

            // Checkout remains disabled until a real checkout flow is implemented.
            elements.checkout.disabled = true;

            showState("content");
        } catch (error) {
            console.error("BookHaven cart error:", error);

            elements.errorMessage.textContent =
                error.message || "Please refresh the page and try again.";

            showState("error");
        }
    }

    function updateQuantity(bookId, newQuantity) {
        const cart = getCart();
        const item = cart.find(
            (cartItem) => String(cartItem.id) === String(bookId)
        );

        if (!item) {
            return;
        }

        const quantity = Number(newQuantity);

        if (!Number.isFinite(quantity) || quantity < 1) {
            showFeedback("Quantity must be at least 1.");
            renderCart();
            return;
        }

        if (quantity > 99) {
            item.quantity = 99;
            showFeedback("The maximum quantity per book is 99.");
        } else {
            item.quantity = Math.floor(quantity);
        }

        saveCart(cart);
        renderCart();
    }

    function removeBook(bookId) {
        const cart = getCart();
        const updatedCart = cart.filter(
            (item) => String(item.id) !== String(bookId)
        );

        if (updatedCart.length === cart.length) {
            return;
        }

        saveCart(updatedCart);
        renderCart();
        showFeedback("Book removed from your cart.");
    }

    function changeQuantity(bookId, amount) {
        const cart = getCart();
        const item = cart.find(
            (cartItem) => String(cartItem.id) === String(bookId)
        );

        if (!item) {
            return;
        }

        const nextQuantity = item.quantity + amount;

        if (nextQuantity < 1 || nextQuantity > 99) {
            return;
        }

        item.quantity = nextQuantity;
        saveCart(cart);
        renderCart();
    }

    elements.items.addEventListener("click", (event) => {
        const button = event.target.closest("[data-cart-action]");

        if (!button) {
            return;
        }

        const bookId = button.dataset.bookId;
        const action = button.dataset.cartAction;

        try {
            if (action === "remove") {
                removeBook(bookId);
            } else if (action === "increase") {
                changeQuantity(bookId, 1);
            } else if (action === "decrease") {
                changeQuantity(bookId, -1);
            }
        } catch (error) {
            console.error("Unable to update cart:", error);
            showFeedback("Unable to update the cart. Please try again.");
        }
    });

    elements.items.addEventListener("change", (event) => {
        const input = event.target.closest("[data-cart-quantity]");

        if (!input) {
            return;
        }

        try {
            updateQuantity(input.dataset.cartQuantity, input.value);
        } catch (error) {
            console.error("Unable to update quantity:", error);
            showFeedback("Unable to update the quantity. Please try again.");
            renderCart();
        }
    });

    elements.retry.addEventListener("click", renderCart);

    elements.checkout.addEventListener("click", () => {
        showFeedback(
            "Checkout is not available yet. We'll connect it in a later milestone."
        );
    });

    // Keep the cart fresh if the user changes it in another browser tab.
    window.addEventListener("storage", (event) => {
        if (event.key === CART_KEY) {
            renderCart();
        }
    });

    // Update the footer year automatically.
    if (elements.currentYear) {
        elements.currentYear.textContent = new Date().getFullYear();
    }

    renderCart();
})();