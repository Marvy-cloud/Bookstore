"use strict";

document.addEventListener("DOMContentLoaded", () => {
    // -----------------------------------------
    // 1. GET PAGE ELEMENTS AND BOOK DATA
    // -----------------------------------------

    const content = document.querySelector("#book-details-content");
    const notFound = document.querySelector("#book-not-found");
    const breadcrumbTitle = document.querySelector("#breadcrumb-title");
    const relatedSection = document.querySelector("#related-section");
    const relatedBooksContainer = document.querySelector("#related-books");

    const books = window.BookHaven?.books ?? [];
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get("id");

    if (!content || !notFound) return;

    // -----------------------------------------
    // 2. HELPER FUNCTIONS
    // -----------------------------------------

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

    function formatPrice(price) {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0
        }).format(price);
    }

    function validPrice(book) {
        const price = Number(book.price);

        return Number.isFinite(price) && price >= 0 ? price : 0;
    }

    // -----------------------------------------
    // 3. FIND THE SELECTED BOOK
    // -----------------------------------------

    const book = books.find((item) => item.id === bookId);

    if (!book) {
        content.hidden = true;
        notFound.hidden = false;
        relatedSection.hidden = true;

        document.title = "Book Not Found | BookHaven";

        if (breadcrumbTitle) {
            breadcrumbTitle.textContent = "Book Not Found";
        }

        return;
    }

    // -----------------------------------------
    // 4. RENDER BOOK INFORMATION
    // -----------------------------------------

    function renderBookDetails() {
        const title = escapeHTML(book.title);
        const author = escapeHTML(book.author);
        const category = escapeHTML(book.category);
        const description = escapeHTML(book.description);
        const image = escapeHTML(book.image);

        const year = Number(book.year);
        const pages = Number(book.pages);

        const validYear =
            Number.isInteger(year) && year > 0 && year <= 9999;

        const validPages =
            Number.isInteger(pages) && pages > 0;

        content.innerHTML = `
      <div class="details-layout">

        <div class="details-cover-panel">
          <img
            class="details-cover"
            src="${image}"
            alt="Cover of ${title}"
            fetchpriority="high"
            onerror="this.onerror=null;this.src='https://placehold.co/300x420/F5EBDD/142B4A?text=Book+Cover'"
          >
        </div>

        <div class="details-content">
          <span class="details-category">
            <i class="fa-solid fa-bookmark" aria-hidden="true"></i>
            ${category}
          </span>

          <h1 class="details-title">${title}</h1>

          <p class="details-author">
            Written by <strong>${author}</strong>
          </p>

          <p class="details-price">${formatPrice(validPrice(book))}</p>

          <h2>About this book</h2>

          <p class="details-description">${description || "A description for this book will be available soon."}</p>

          <div class="details-purchase">
            <div class="quantity-control" aria-label="Select quantity">
              <button
                id="quantity-decrease"
                type="button"
                aria-label="Decrease quantity"
                disabled
              >
                <i class="fa-solid fa-minus" aria-hidden="true"></i>
              </button>

              <label class="sr-only" for="book-quantity">Quantity</label>

              <input
                id="book-quantity"
                type="number"
                min="1"
                max="99"
                step="1"
                value="1"
                inputmode="numeric"
              >

              <button
                id="quantity-increase"
                type="button"
                aria-label="Increase quantity"
              >
                <i class="fa-solid fa-plus" aria-hidden="true"></i>
              </button>
            </div>

            <button
              class="btn btn-primary details-add-button"
              id="details-add-to-cart"
              type="button"
              data-add-to-cart="${escapeHTML(book.id)}"
              data-quantity="1"
            >
              <i class="fa-solid fa-bag-shopping" aria-hidden="true"></i>
              Add to cart
            </button>
          </div>

          <p
            id="details-feedback"
            class="details-feedback"
            role="status"
            aria-live="polite"
          ></p>

          <div class="details-meta">
            <div class="details-meta-item">
              <span class="details-meta-icon">
                <i class="fa-solid fa-layer-group" aria-hidden="true"></i>
              </span>
              <div>
                <span>Category</span>
                <strong>${category}</strong>
              </div>
            </div>

            <div class="details-meta-item">
              <span class="details-meta-icon">
                <i class="fa-regular fa-calendar" aria-hidden="true"></i>
              </span>
              <div>
                <span>Publication year</span>
                <strong>${validYear ? year : "Not specified"}</strong>
              </div>
            </div>

            <div class="details-meta-item">
              <span class="details-meta-icon">
                <i class="fa-solid fa-file-lines" aria-hidden="true"></i>
              </span>
              <div>
                <span>Pages</span>
                <strong>${validPages ? pages : "Not specified"}</strong>
              </div>
            </div>

            <div class="details-meta-item">
              <span class="details-meta-icon">
                <i class="fa-solid fa-user-pen" aria-hidden="true"></i>
              </span>
              <div>
                <span>Author</span>
                <strong>${author}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

        content.hidden = false;
        content.setAttribute("aria-busy", "false");

        if (breadcrumbTitle) {
            breadcrumbTitle.textContent = book.title;
        }

        document.title = `${book.title} | BookHaven`;

        setupQuantityControls();
    }

    // -----------------------------------------
    // 5. QUANTITY CONTROLS
    // -----------------------------------------

    function setupQuantityControls() {
        const quantityInput = document.querySelector("#book-quantity");
        const decreaseButton = document.querySelector("#quantity-decrease");
        const increaseButton = document.querySelector("#quantity-increase");
        const addButton = document.querySelector("#details-add-to-cart");
        const feedback = document.querySelector("#details-feedback");

        if (
            !quantityInput ||
            !decreaseButton ||
            !increaseButton ||
            !addButton ||
            !feedback
        ) {
            return;
        }

        const MIN_QUANTITY = 1;
        const MAX_QUANTITY = 99;

        function readQuantity() {
            const value = quantityInput.valueAsNumber;

            if (
                !Number.isFinite(value) ||
                !Number.isInteger(value) ||
                value < MIN_QUANTITY ||
                value > MAX_QUANTITY
            ) {
                return null;
            }

            return value;
        }

        function updateQuantityUI() {
            const quantity = readQuantity();

            decreaseButton.disabled = quantity === MIN_QUANTITY;
            increaseButton.disabled = quantity === MAX_QUANTITY;

            addButton.dataset.quantity = quantity ?? "";

            addButton.disabled = quantity === null;

            if (quantity !== null) {
                feedback.textContent = "";
                feedback.classList.remove("error");
            }
        }

        decreaseButton.addEventListener("click", () => {
            const current = readQuantity() ?? MIN_QUANTITY;

            quantityInput.value = Math.max(
                MIN_QUANTITY,
                current - 1
            );

            updateQuantityUI();
        });

        increaseButton.addEventListener("click", () => {
            const current = readQuantity() ?? MIN_QUANTITY;

            quantityInput.value = Math.min(
                MAX_QUANTITY,
                current + 1
            );

            updateQuantityUI();
        });

        quantityInput.addEventListener("input", updateQuantityUI);
        quantityInput.addEventListener("change", () => {
            if (readQuantity() === null) {
                feedback.textContent = "Enter a quantity between 1 and 99.";
                feedback.classList.add("error");
                return;
            }

            updateQuantityUI();
        });

        // The shared click handler in main.js adds the selected quantity.
        addButton.addEventListener("click", () => {
            const quantity = readQuantity();

            if (quantity === null) {
                feedback.textContent = "Enter a quantity between 1 and 99.";
                feedback.classList.add("error");
                quantityInput.focus();
                return;
            }

            // Let main.js handle the cart update.
            feedback.textContent =
                `${quantity} ${quantity === 1 ? "copy" : "copies"} of "${book.title}" added to your cart.`;

            feedback.classList.remove("error");
        });

        updateQuantityUI();
    }

    // -----------------------------------------
    // 6. RELATED BOOKS
    // -----------------------------------------

    function renderRelatedBooks() {
        if (!relatedSection || !relatedBooksContainer) return;

        const related = books
            .filter((item) => item.id !== book.id)
            .sort((a, b) => {
                const aMatch = a.category === book.category ? 1 : 0;
                const bMatch = b.category === book.category ? 1 : 0;

                return bMatch - aMatch ||
                    Number(Boolean(b.featured)) - Number(Boolean(a.featured));
            })
            .slice(0, 4);

        if (related.length === 0) {
            relatedSection.hidden = true;
            return;
        }

        relatedBooksContainer.innerHTML = related.map((item) => `
      <article class="book-card">
        <a
          class="book-cover-link"
          href="book-details.html?id=${encodeURIComponent(item.id)}"
        >
          <img
            class="book-cover"
            src="${escapeHTML(item.image)}"
            alt="Cover of ${escapeHTML(item.title)}"
            loading="lazy"
            onerror="this.onerror=null;this.src='https://placehold.co/300x420/F5EBDD/142B4A?text=Book+Cover'"
          >
        </a>

        <div class="book-info">
          <span class="book-category">${escapeHTML(item.category)}</span>

          <h3 class="book-title">
            <a href="book-details.html?id=${encodeURIComponent(item.id)}">
              ${escapeHTML(item.title)}
            </a>
          </h3>

          <p class="book-author">by ${escapeHTML(item.author)}</p>

          <div class="book-card-bottom">
            <span class="book-price">${formatPrice(validPrice(item))}</span>

            <button
              class="add-to-cart"
              type="button"
              data-add-to-cart="${escapeHTML(item.id)}"
              aria-label="Add ${escapeHTML(item.title)} to cart"
            >
              <i class="fa-solid fa-plus" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </article>
    `).join("");

        relatedSection.hidden = false;
    }

    // -----------------------------------------
    // 7. INITIALIZE PAGE
    // -----------------------------------------

    renderBookDetails();
    renderRelatedBooks();
});