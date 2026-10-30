"use strict";

// Reviews for the book details page.
// Reviews are saved in the browser (localStorage), so they are only
// visible in the browser where they were written.

document.addEventListener("DOMContentLoaded", () => {
    // -----------------------------------------
    // 1. GET PAGE ELEMENTS AND FIND THE BOOK
    // -----------------------------------------

    const section = document.querySelector("#reviews-section");
    const summary = document.querySelector("#review-summary");
    const list = document.querySelector("#review-list");
    const form = document.querySelector("#review-form");
    const feedback = document.querySelector("#review-feedback");

    if (!section || !summary || !list || !form || !feedback) return;

    const books = window.BookHaven?.books ?? [];
    const bookId = new URLSearchParams(window.location.search).get("id");
    const book = books.find((item) => item.id === bookId);

    // If the book does not exist, the reviews section stays hidden.
    if (!book) return;

    const STORAGE_KEY = "bookhaven-reviews";

    // -----------------------------------------
    // 2. SAMPLE REVIEWS (DEMO CONTENT ONLY)
    // -----------------------------------------
    // These are made-up reviews so the page does not look empty while the
    // site is being built. Delete this object before the site goes live
    // with real customers.

    const SAMPLE_REVIEWS = {
        "atomic-habits": [
            { name: "Chioma A.", rating: 5, date: "2026-09-14", comment: "I stopped trying to change everything at once and focused on tiny habits instead. Two months in, I am reading every night. Easy to follow and full of practical examples." },
            { name: "Tunde B.", rating: 5, date: "2026-08-30", comment: "The idea of getting 1% better each day sounds simple, but the way the author explains it made it stick. I keep coming back to the chapter on habit stacking." },
            { name: "Amaka O.", rating: 4, date: "2026-08-02", comment: "Very useful and easy to read. A few sections repeat the same point, but the core ideas are worth it." }
        ],
        "psychology-of-money": [
            { name: "Ibrahim S.", rating: 5, date: "2026-09-20", comment: "No complicated formulas, just stories about how people behave with money. It changed how I think about saving and spending." },
            { name: "Funke A.", rating: 4, date: "2026-09-05", comment: "Short chapters that you can finish in one sitting. I liked the point that doing well with money is more about behaviour than intelligence." },
            { name: "Emeka N.", rating: 5, date: "2026-07-18", comment: "I recommended this to my younger brother after finishing it. Simple language and a lot of wisdom." }
        ],
        "deep-work": [
            { name: "Zainab Y.", rating: 5, date: "2026-10-01", comment: "As a student, this was exactly what I needed. I now switch my phone off for two hours of focused study and the difference is clear." },
            { name: "David K.", rating: 4, date: "2026-09-10", comment: "The first half explains why focus matters and the second half gives real strategies. Some ideas are hard to apply with a busy schedule, but still worth reading." },
            { name: "Ngozi E.", rating: 4, date: "2026-08-15", comment: "Made me look honestly at how much time I waste switching between tasks. A bit long in places." }
        ],
        "rich-dad-poor-dad": [
            { name: "Samuel O.", rating: 4, date: "2026-09-25", comment: "A good starting point for thinking about assets and income. I did not agree with everything, but it got me asking better questions about money." },
            { name: "Halima M.", rating: 5, date: "2026-08-21", comment: "I read it in a weekend. The story format keeps it interesting, and it made me start my first savings plan." },
            { name: "Kelechi U.", rating: 3, date: "2026-07-29", comment: "Motivating, but it is light on practical details. Good as an introduction, not as a complete guide." }
        ],
        "the-alchemist": [
            { name: "Bisi T.", rating: 5, date: "2026-10-08", comment: "A short, beautiful story about following your dreams. I finished it in two days and I keep thinking about the ending." },
            { name: "Yusuf A.", rating: 4, date: "2026-09-02", comment: "Simple writing with a deep message. Some parts feel a little predictable, but the journey is lovely." },
            { name: "Grace I.", rating: 5, date: "2026-08-11", comment: "I have read it three times now and I notice something new each time. A perfect gift for a friend." }
        ],
        "ikigai": [
            { name: "Chinedu P.", rating: 4, date: "2026-09-18", comment: "A calm, gentle read about finding purpose and living a long life. I liked the small daily habits people in Okinawa follow." },
            { name: "Tolu R.", rating: 5, date: "2026-08-27", comment: "Short, peaceful and encouraging. It made me slow down and think about what really matters in my day." },
            { name: "Mariam L.", rating: 3, date: "2026-07-22", comment: "Nice ideas and lovely stories, though I wanted more depth in some chapters." }
        ],
        "long-walk-to-freedom": [
            { name: "Femi D.", rating: 5, date: "2026-09-29", comment: "Powerful and moving. It is long, but every chapter shows the patience and courage it took to change a country." },
            { name: "Adaeze C.", rating: 5, date: "2026-08-19", comment: "I learned so much about history and about resilience. It takes time to read, but it is absolutely worth it." },
            { name: "Joshua E.", rating: 4, date: "2026-07-30", comment: "A serious, honest autobiography. The early chapters move slowly, but the story gets stronger as it goes on." }
        ],
        "clean-code": [
            { name: "Sade W.", rating: 5, date: "2026-10-05", comment: "As someone learning to code, this changed how I name variables and write functions. I wish I had read it sooner." },
            { name: "Obinna G.", rating: 4, date: "2026-09-12", comment: "Full of practical advice on writing code other people can read. The examples are in Java, but the ideas apply to any language." },
            { name: "Hauwa B.", rating: 4, date: "2026-08-08", comment: "Dense in places and better read slowly, a chapter at a time. My code reviews have improved since." }
        ]
    };

    // -----------------------------------------
    // 3. HELPER FUNCTIONS
    // -----------------------------------------

    // Stops anything a visitor types from being treated as HTML.
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

    function formatDate(isoDate) {
        const date = new Date(isoDate);

        if (Number.isNaN(date.getTime())) return "";

        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    function starsHTML(rating) {
        const filled = Math.round(rating);
        let icons = "";

        for (let i = 1; i <= 5; i++) {
            const style = i <= filled ? "fa-solid" : "fa-regular";
            icons += `<i class="${style} fa-star" aria-hidden="true"></i>`;
        }

        return `<span class="stars" role="img" aria-label="${filled} out of 5 stars">${icons}</span>`;
    }

    // -----------------------------------------
    // 4. LOAD AND SAVE REVIEWS
    // -----------------------------------------

    // Everything saved in the browser, for all books: { bookId: [reviews] }
    function loadSavedReviews() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
            return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
        } catch {
            return {};
        }
    }

    function writeSavedReviews(allSaved) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allSaved));
            return true;
        } catch {
            return false;
        }
    }

    function getSavedForThisBook() {
        const saved = loadSavedReviews()[book.id];
        return Array.isArray(saved) ? saved : [];
    }

    // Visitor reviews and sample reviews together, newest first.
    function getAllReviews() {
        const samples = (SAMPLE_REVIEWS[book.id] ?? []).map((review) => ({
            ...review,
            isSample: true
        }));

        return [...getSavedForThisBook(), ...samples].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        );
    }

    // -----------------------------------------
    // 5. SHOW THE SUMMARY AND THE LIST
    // -----------------------------------------

    function renderSummary(reviews) {
        if (reviews.length === 0) {
            summary.innerHTML = "";
            return;
        }

        const total = reviews.reduce((sum, review) => sum + review.rating, 0);
        const average = total / reviews.length;

        summary.innerHTML = `
      <strong class="review-average">${average.toFixed(1)}</strong>
      <div class="review-summary-meta">
        ${starsHTML(average)}
        <span>${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}</span>
      </div>
    `;
    }

    function renderList(reviews) {
        if (reviews.length === 0) {
            list.innerHTML = `
        <p class="review-empty">
          No reviews yet. Be the first to share what you thought.
        </p>
      `;
            return;
        }

        list.innerHTML = reviews.map((review) => `
      <article class="review-card">
        <div class="review-card-top">
          <span class="review-avatar" aria-hidden="true">
            ${escapeHTML(review.name.charAt(0).toUpperCase())}
          </span>

          <div>
            <strong class="review-author">${escapeHTML(review.name)}</strong>
            <span class="review-date">${formatDate(review.date)}</span>
          </div>

          <div class="review-card-rating">${starsHTML(review.rating)}</div>
        </div>

        <p class="review-text">${escapeHTML(review.comment)}</p>

        ${review.isSample ? "" : `
          <button class="review-delete" type="button" data-delete-review="${escapeHTML(review.id)}">
            <i class="fa-regular fa-trash-can" aria-hidden="true"></i>
            Remove my review
          </button>
        `}
      </article>
    `).join("");
    }

    function renderReviews() {
        const reviews = getAllReviews();
        renderSummary(reviews);
        renderList(reviews);
    }

    // -----------------------------------------
    // 6. SUBMIT A NEW REVIEW
    // -----------------------------------------

    function showFeedback(message, type) {
        feedback.textContent = message;
        feedback.className = `review-feedback ${type}`;
    }

    form.addEventListener("submit", (event) => {
        // Stop the page from reloading.
        event.preventDefault();

        const selected = form.querySelector('input[name="rating"]:checked');
        const name = form.elements["review-name"].value.trim();
        const comment = form.elements["review-comment"].value.trim();

        if (!selected) {
            showFeedback("Please choose a star rating.", "is-error");
            return;
        }

        if (name.length < 2) {
            showFeedback("Please enter your name (at least 2 characters).", "is-error");
            form.elements["review-name"].focus();
            return;
        }

        if (comment.length < 10) {
            showFeedback("Please write a little more (at least 10 characters).", "is-error");
            form.elements["review-comment"].focus();
            return;
        }

        const newReview = {
            id: String(Date.now()),
            name,
            rating: Number(selected.value),
            comment,
            date: new Date().toISOString()
        };

        const allSaved = loadSavedReviews();
        allSaved[book.id] = [newReview, ...getSavedForThisBook()];

        if (!writeSavedReviews(allSaved)) {
            showFeedback("Your review could not be saved in this browser.", "is-error");
            return;
        }

        form.reset();
        renderReviews();
        showFeedback("Thank you! Your review has been added.", "is-success");
    });

    // -----------------------------------------
    // 7. REMOVE A REVIEW YOU WROTE
    // -----------------------------------------

    list.addEventListener("click", (event) => {
        const button = event.target.closest("[data-delete-review]");

        if (!button) return;

        const allSaved = loadSavedReviews();

        allSaved[book.id] = getSavedForThisBook().filter(
            (review) => review.id !== button.dataset.deleteReview
        );

        writeSavedReviews(allSaved);
        renderReviews();
        showFeedback("Your review was removed.", "is-success");
    });

    // -----------------------------------------
    // 8. START
    // -----------------------------------------

    section.hidden = false;
    renderReviews();
});
