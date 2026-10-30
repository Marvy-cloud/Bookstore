const catalog = window.BookHaven?.books ?? [];

const formatPrice = (price) =>
    new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0
    }).format(price);

function getCart() {
    try {
        const cart = JSON.parse(localStorage.getItem("bookhaven-cart") || "[]");
        return Array.isArray(cart) ? cart : [];
    } catch {
        return [];
    }
}

function updateCartCount() {
    const count = getCart().reduce(
        (total, item) => total + Math.max(0, Number(item.quantity) || 0),
        0
    );

    document.querySelectorAll("[data-cart-count]").forEach((element) => {
        element.textContent = count;
    });
}

function renderFeaturedBooks() {
    const container = document.querySelector("#featured-books");
    if (!container) return;

    const featuredBooks = catalog.filter((book) => book.featured).slice(0, 4);

    container.innerHTML = featuredBooks.map((book) => `
    <article class="book-card">
      <a class="book-cover-link"
         href="book-details.html?id=${encodeURIComponent(book.id)}">
        <img class="book-cover"
          src="${book.image}"
          alt="Cover of ${book.title}"
          loading="lazy"
          onerror="this.onerror=null;this.src='https://placehold.co/300x420/F5EBDD/142B4A?text=Book+Cover'">
      </a>

      <div class="book-info">
        <span class="book-category">${book.category}</span>
        <h3 class="book-title">
          <a href="book-details.html?id=${encodeURIComponent(book.id)}">
            ${book.title}
          </a>
        </h3>
        <p class="book-author">by ${book.author}</p>

        <div class="book-card-bottom">
          <span class="book-price">${formatPrice(book.price)}</span>
          <button class="add-to-cart"
            type="button"
            data-add-to-cart="${book.id}"
            aria-label="Add ${book.title} to cart">
            <i class="fa-solid fa-plus" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </article>
  `).join("");
}

function addBookToCart(bookId, requestedQuantity = 1) {
    const book = catalog.find((item) => item.id === bookId);
    if (!book) return;

    const quantity = Number(requestedQuantity);

    if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 99
    ) {
        return;
    }

    const cart = getCart();
    const existingItem = cart.find((item) => item.id === bookId);

    if (existingItem) {
        const currentQuantity = Number(existingItem.quantity) || 0;

        // Do not let the quantity of an item exceed 99.
        if (currentQuantity + quantity > 99) {
            return;
        }

        existingItem.quantity = currentQuantity + quantity;
    } else {
        cart.push({
            id: bookId,
            quantity
        });
    }

    localStorage.setItem("bookhaven-cart", JSON.stringify(cart));
    updateCartCount();

    const button = document.querySelector(
        `[data-add-to-cart="${CSS.escape(bookId)}"]`
    );

    if (button) {
        const previousHTML = button.innerHTML;
        const previousLabel = button.getAttribute("aria-label");

        button.innerHTML =
            '<i class="fa-solid fa-check" aria-hidden="true"></i>';

        button.setAttribute("aria-label", `${book.title} added to cart`);

        window.setTimeout(() => {
            button.innerHTML = previousHTML;

            if (previousLabel) {
                button.setAttribute("aria-label", previousLabel);
            }
        }, 900);
    }
}
function setupNavigation() {
    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector("#primary-nav");

    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
        toggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation" : "Open navigation"
        );
        toggle.innerHTML = isOpen
            ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
            : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    });

    nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            nav.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "Open navigation");
            toggle.innerHTML =
                '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
        });
    });
}

document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-to-cart]");

    if (!button || button.disabled) return;

    const requestedQuantity = button.dataset.quantity || 1;

    addBookToCart(
        button.dataset.addToCart,
        requestedQuantity
    );
});

document.addEventListener("DOMContentLoaded", () => {
    renderFeaturedBooks();
    updateCartCount();
    setupNavigation();

    const year = document.querySelector("#current-year");
    if (year) year.textContent = new Date().getFullYear();
});