const books = [
    {
        id: "atomic-habits",
        title: "Atomic Habits",
        author: "James Clear",
        price: 12500,
        category: "Self-Help",
        featured: true,
        image: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
        description: "A practical guide to building good habits, breaking bad ones and making small improvements that compound over time.",
        year: 2018,
        pages: 320
    },
    {
        id: "psychology-of-money",
        title: "The Psychology of Money",
        author: "Morgan Housel",
        price: 11000,
        category: "Business",
        featured: true,
        image: "https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg",
        description: "Lessons on how people think about money, risk, wealth and the decisions that shape financial outcomes.",
        year: 2020,
        pages: 256
    },
    {
        id: "deep-work",
        title: "Deep Work",
        author: "Cal Newport",
        price: 10500,
        category: "Self-Help",
        featured: true,
        image: "https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg",
        description: "An exploration of focused work and how to cultivate concentration in a world full of distractions.",
        year: 2016,
        pages: 304
    },
    {
        id: "rich-dad-poor-dad",
        title: "Rich Dad Poor Dad",
        author: "Robert T. Kiyosaki",
        price: 9500,
        category: "Business",
        featured: true,
        image: "https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg",
        description: "A personal-finance book exploring different attitudes toward money, work and building assets.",
        year: 1997,
        pages: 336
    },
    {
        id: "the-alchemist",
        title: "The Alchemist",
        author: "Paulo Coelho",
        price: 8500,
        category: "Fiction",
        featured: true,
        image: "https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg",
        description: "A philosophical adventure about a young shepherd following a dream and discovering meaning along the way.",
        year: 1988,
        pages: 208
    },
    {
        id: "ikigai",
        title: "Ikigai",
        author: "Héctor García and Francesc Miralles",
        price: 9000,
        category: "Self-Help",
        featured: true,
        image: "https://covers.openlibrary.org/b/isbn/9780143130727-L.jpg",
        description: "An introduction to the Japanese concept of purpose and the everyday practices that can enrich life.",
        year: 2016,
        pages: 208
    },
    {
        id: "long-walk-to-freedom",
        title: "Long Walk to Freedom",
        author: "Nelson Mandela",
        price: 15000,
        category: "Biography",
        featured: false,
        image: "https://covers.openlibrary.org/b/isbn/9780316548182-L.jpg",
        description: "Nelson Mandela's autobiography recounting his life, political struggle and the path toward freedom.",
        year: 1994,
        pages: 656
    },
    {
        id: "clean-code",
        title: "Clean Code",
        author: "Robert C. Martin",
        price: 18000,
        category: "Technology",
        featured: false,
        image: "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg",
        description: "Principles and examples for writing readable, maintainable and well-structured software.",
        year: 2008,
        pages: 464
    }
];

window.BookHaven = { books };