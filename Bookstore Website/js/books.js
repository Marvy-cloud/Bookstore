"use strict";

document.addEventListener("DOMContentLoaded", () => {
    // -----------------------------------------
    // 1. DOM ELEMENTS
    // -----------------------------------------

    const grid = document.querySelector("#books-grid");
    const searchInput = document.querySelector("#book-search");
    const clearSearchButton = document.querySelector("#clear-search");
    const categoryFilter = document.querySelector("#category-filter");
    const sortSelect = document.querySelector("#sort-books");
    const resetButton = document.querySelector("#reset-filters");
    const emptyResetButton = document.querySelector("#empty-reset");
    const emptyState = document.querySelector("#empty-state");
    const resultsCount = document.querySelector("#results-count");

    if (
        !grid ||
        !searchInput ||
        !categoryFilter ||
        !sortSelect ||
        !emptyState ||
        !resultsCount
    ) {
        return;
    }

    // -----------------------------------------
    // 2. BOOK DATA
    // -----------------------------------------

    const books = window.BookHaven?.books ?? [];

    // Read search and category parameters from the URL.
    const params = new URLSearchParams(window.location.search);

    const initialSearch = params.get("q") || "";
    const requestedCategory = params.get("category") || "";

    const categories = [
        ...new Set(
            books
                .map((book) => book.category)
                .filter(Boolean)
        )
    ].sort((a, b) => a.localeCompare(b));

    // -----------------------------------------
    // 3. HELPER FUNCTIONS
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

    function normalize(value) {
        return String(value ?? "").trim().toLocaleLowerCase();
    }

    function getValidPrice(book) {
        const price = Number(book.price);

        return Number.isFinite(price) && price >= 0
            ? price
            : 0;
    }

    // -----------------------------------------
    // 4. CATEGORY FILTER OPTIONS
    // -----------------------------------------

    function populateCategories() {
        categoryFilter.innerHTML = `
      <option value="all">All categories</option>
      ${categories.map((category) => `
        <option value="${escapeHTML(category)}">
          ${escapeHTML(category)}
        </option>
      `).join("")}
    `;

        const matchingCategory = categories.find(
            (category) => normalize(category) === normalize(requestedCategory)
        );

        if (matchingCategory) {
            categoryFilter.value = matchingCategory;
        }
    }

    // -----------------------------------------
    // 5. FILTER BOOKS
    // -----------------------------------------

    function getFilteredBooks() {
        const query = normalize(searchInput.value);
        const selectedCategory = categoryFilter.value;

        return books.filter((book) => {
            const matchesSearch =
                normalize(book.title).includes(query) ||
                normalize(book.author).includes(query);

            const matchesCategory =
                selectedCategory === "all" ||
                normalize(book.category) === normalize(selectedCategory);

            return matchesSearch && matchesCategory;
        });
    }

    // -----------------------------------------
    // 6. SORT BOOKS
    // -----------------------------------------

    function sortBooks(filteredBooks) {
        const sortedBooks = [...filteredBooks];

        switch (sortSelect.value) {
            case "title-asc":
                sortedBooks.sort((a, b) =>
                    String(a.title).localeCompare(String(b.title))
                );
                break;

            case "title-desc":
                sortedBooks.sort((a, b) =>
                    String(b.title).localeCompare(String(a.title))
                );
                break;

            case "price-asc":
                sortedBooks.sort(
                    (a, b) => getValidPrice(a) - getValidPrice(b)
                );
                break;

            case "price-desc":
                sortedBooks.sort(
                    (a, b) => getValidPrice(b) - getValidPrice(a)
                );
                break;

            case "featured":
            default:
                sortedBooks.sort((a, b) => {
                    const featuredDifference =
                        Number(Boolean(b.featured)) -
                        Number(Boolean(a.featured));

                    if (featuredDifference !== 0) {
                        return featuredDifference;
                    }

                    return String(a.title).localeCompare(String(b.title));
                });
                break;
        }

        return sortedBooks;
    }

    // -----------------------------------------
    // 7. CREATE BOOK CARDS
    // -----------------------------------------

    function createBookCard(book) {
        const id = escapeHTML(book.id);
        const title = escapeHTML(book.title);
        const author = escapeHTML(book.author);
        const category = escapeHTML(book.category);
        const image = escapeHTML(book.image);
        const price = formatPrice(getValidPrice(book));

        return `
      <article class="book-card">
        <a
          class="book-cover-link"
          href="book-details.html?id=${encodeURIComponent(book.id)}"
          aria-label="View details for ${title}"
        >
          <img
            class="book-cover"
            src="${image}"
            alt="Cover of ${title}"
            loading="lazy"
            onerror="this.onerror=null;this.src='https://placehold.co/300x420/F5EBDD/142B4A?text=Book+Cover'"
          >
        </a>

        <div class="book-info">
          <span class="book-category">${category}</span>

          <h3 class="book-title">
            <a href="book-details.html?id=${encodeURIComponent(book.id)}">
              ${title}
            </a>
          </h3>

          <p class="book-author">by ${author}</p>

          <div class="book-card-bottom">
            <span class="book-price">${price}</span>

            <button
              class="add-to-cart"
              type="button"
              data-add-to-cart="${id}"
              aria-label="Add ${title} to cart"
            >
              <i class="fa-solid fa-plus" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </article>
    `;
    }

    // -----------------------------------------
    // 8. UPDATE THE RESULTS COUNT
    // -----------------------------------------

    function updateResultsCount(count) {
        const total = books.length;

        resultsCount.textContent =
            `Showing ${count} of ${total} ${total === 1 ? "book" : "books"}`;
    }

    // -----------------------------------------
    // 9. RENDER THE CATALOGUE
    // -----------------------------------------

    function renderBooks() {
        const filteredBooks = getFilteredBooks();
        const sortedBooks = sortBooks(filteredBooks);

        updateResultsCount(sortedBooks.length);

        const hasResults = sortedBooks.length > 0;

        grid.hidden = !hasResults;
        emptyState.hidden = hasResults;

        grid.setAttribute("aria-busy", "false");

        if (!hasResults) {
            grid.innerHTML = "";
            return;
        }

        grid.innerHTML = sortedBooks
            .map(createBookCard)
            .join("");
    }

    // -----------------------------------------
    // 10. KEEP URL PARAMETERS IN SYNC
    // -----------------------------------------

    function updateURL() {
        const url = new URL(window.location.href);
        const query = searchInput.value.trim();
        const category = categoryFilter.value;

        if (query) {
            url.searchParams.set("q", query);
        } else {
            url.searchParams.delete("q");
        }

        if (category !== "all") {
            url.searchParams.set("category", category);
        } else {
            url.searchParams.delete("category");
        }

        history.replaceState(null, "", url);
    }

    // -----------------------------------------
    // 11. REFRESH THE CATALOGUE
    // -----------------------------------------

    function refreshCatalogue() {
        clearSearchButton.hidden = !searchInput.value;
        renderBooks();
        updateURL();
    }

    // -----------------------------------------
    // 12. EVENT LISTENERS
    // -----------------------------------------

    searchInput.addEventListener("input", refreshCatalogue);

    categoryFilter.addEventListener("change", refreshCatalogue);

    sortSelect.addEventListener("change", renderBooks);

    clearSearchButton?.addEventListener("click", () => {
        searchInput.value = "";
        searchInput.focus();
        refreshCatalogue();
    });

    function resetFilters() {
        searchInput.value = "";
        categoryFilter.value = "all";
        sortSelect.value = "featured";

        refreshCatalogue();
        searchInput.focus();
    }

    resetButton?.addEventListener("click", resetFilters);
    emptyResetButton?.addEventListener("click", resetFilters);

    // -----------------------------------------
    // 13. INITIALIZE
    // -----------------------------------------

    searchInput.value = initialSearch;

    populateCategories();

    clearSearchButton.hidden = !initialSearch;

    renderBooks();
});