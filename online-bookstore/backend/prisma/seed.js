const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ── Fixed ISBNs so upsert works correctly on every run ──
// Section 1: "Recommended for You" (indices 0–2)
// Section 2: "Bestsellers this Month" (indices 3–5)
// Section 3: "New Launches" (indices 6–8)
// Extra books for catalogue browsing (indices 9+)
const BOOKS = [
  // ── Recommended for You ──
  {
    isbn: '978-1000000001',
    title: 'The Art of Focus',
    author: 'Arjun Patel',
    description: 'Practical guide to mastering focus & boosting productivity every day.',
    price: 399, discountPercent: 0,
    categorySlug: 'self-help', brandSlug: 'penguin-random-house',
    rating: 4.5, reviewCount: 234, format: 'Paperback',
  },
  {
    isbn: '978-1000000002',
    title: 'The Art of Learning',
    author: 'Raj Patel',
    description: 'Master the mindset and methods for effective lifelong learning.',
    price: 259, discountPercent: 10,
    categorySlug: 'self-help', brandSlug: 'harpercollins',
    rating: 4.3, reviewCount: 187, format: 'Paperback',
  },
  {
    isbn: '978-1000000003',
    title: 'The Path to Success',
    author: 'James Wright',
    description: 'A practical guide to achieving goals with clarity and confidence.',
    price: 359, discountPercent: 5,
    categorySlug: 'self-help', brandSlug: 'simon-schuster',
    rating: 4.1, reviewCount: 156, format: 'Paperback',
  },

  // ── Bestsellers this Month ──
  {
    isbn: '978-1000000004',
    title: 'The Midnight Hour',
    author: 'James Adams',
    description: "Haunting tale of a man's journey & the shadows of a forgotten past.",
    price: 299, discountPercent: 0,
    categorySlug: 'thriller', brandSlug: 'penguin-random-house',
    rating: 4.6, reviewCount: 412, format: 'Paperback',
  },
  {
    isbn: '978-1000000005',
    title: 'Beneath the Stars',
    author: 'Jessica Martin',
    description: 'A heartwarming tale, where two souls discover who you need.',
    price: 499, discountPercent: 0,
    categorySlug: 'romance', brandSlug: 'harpercollins',
    rating: 4.4, reviewCount: 321, format: 'Hard Cover',
  },
  {
    isbn: '978-1000000006',
    title: 'The Final Frontier',
    author: 'Laura Mitchell',
    description: 'A mission to space secrets to change humanity forever.',
    price: 359, discountPercent: 0,
    categorySlug: 'science', brandSlug: 'oreilly-media',
    rating: 4.7, reviewCount: 289, format: 'Paperback',
  },

  // ── New Launches ──
  {
    isbn: '978-1000000007',
    title: 'Joy of Minimalism',
    author: 'Daniel Reed',
    description: 'Declutter your life to uncover peace, clarity, and joy.',
    price: 149, discountPercent: 15,
    categorySlug: 'self-help', brandSlug: 'simon-schuster',
    rating: 4.2, reviewCount: 198, format: 'Paperback',
  },
  {
    isbn: '978-1000000008',
    title: 'The Vanishing House',
    author: 'Clara Nelson',
    description: 'A chilling mystery unfolds within a house that disappears.',
    price: 99, discountPercent: 20,
    categorySlug: 'thriller', brandSlug: 'penguin-random-house',
    rating: 4.0, reviewCount: 143, format: 'eBook',
  },
  {
    isbn: '978-1000000009',
    title: 'The Lost Kitten',
    author: 'Emily Parker',
    description: 'A heartwarming tale of courage, friendship, and feline adventure.',
    price: 339, discountPercent: 0,
    categorySlug: 'children', brandSlug: 'harpercollins',
    rating: 4.8, reviewCount: 567, format: 'Hardcover',
  },

  // ── Technology ──
  {
    isbn: '978-1000000010',
    title: 'Clean Code',
    author: 'Robert Martin',
    description: 'A handbook of agile software craftsmanship for professional developers.',
    price: 549, discountPercent: 5,
    categorySlug: 'technology', brandSlug: 'oreilly-media',
    rating: 4.9, reviewCount: 892, format: 'Paperback',
  },
  {
    isbn: '978-1000000011',
    title: 'Python Crash Course',
    author: 'Eric Matthes',
    description: 'A hands-on, project-based introduction to Python programming.',
    price: 499, discountPercent: 8,
    categorySlug: 'technology', brandSlug: 'oreilly-media',
    rating: 4.6, reviewCount: 723, format: 'Paperback',
  },
  {
    isbn: '978-1000000012',
    title: 'The Pragmatic Programmer',
    author: 'David Thomas',
    description: 'Your journey to mastery — from journeyman to master programmer.',
    price: 579, discountPercent: 10,
    categorySlug: 'technology', brandSlug: 'oreilly-media',
    rating: 4.8, reviewCount: 654, format: 'Paperback',
  },

  // ── Self Help ──
  {
    isbn: '978-1000000013',
    title: 'Atomic Habits',
    author: 'James Clear',
    description: 'Tiny changes, remarkable results. An easy and proven way to build good habits.',
    price: 399, discountPercent: 10,
    categorySlug: 'self-help', brandSlug: 'penguin-random-house',
    rating: 4.8, reviewCount: 2341, format: 'Paperback',
  },
  {
    isbn: '978-1000000014',
    title: 'The Power of Now',
    author: 'Eckhart Tolle',
    description: 'A guide to spiritual enlightenment through present-moment awareness.',
    price: 299, discountPercent: 0,
    categorySlug: 'self-help', brandSlug: 'harpercollins',
    rating: 4.5, reviewCount: 1876, format: 'Paperback',
  },

  // ── Business ──
  {
    isbn: '978-1000000015',
    title: 'The Lean Startup',
    author: 'Eric Ries',
    description: 'How constant innovation creates radically successful businesses.',
    price: 349, discountPercent: 0,
    categorySlug: 'business', brandSlug: 'simon-schuster',
    rating: 4.5, reviewCount: 934, format: 'Paperback',
  },
  {
    isbn: '978-1000000016',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    description: 'Timeless lessons on wealth, greed, and happiness.',
    price: 329, discountPercent: 12,
    categorySlug: 'business', brandSlug: 'penguin-random-house',
    rating: 4.6, reviewCount: 1456, format: 'Paperback',
  },
  {
    isbn: '978-1000000017',
    title: 'Rich Dad Poor Dad',
    author: 'Robert Kiyosaki',
    description: "What the rich teach their kids about money that the poor and middle class do not.",
    price: 299, discountPercent: 5,
    categorySlug: 'business', brandSlug: 'simon-schuster',
    rating: 4.4, reviewCount: 2876, format: 'Paperback',
  },

  // ── Fiction ──
  {
    isbn: '978-1000000018',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'A story of the fabulously wealthy Jay Gatsby and his love for Daisy Buchanan.',
    price: 199, discountPercent: 0,
    categorySlug: 'fiction', brandSlug: 'penguin-random-house',
    rating: 4.3, reviewCount: 1204, format: 'Paperback',
  },
  {
    isbn: '978-1000000019',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    description: "Pulitzer Prize winning masterwork of honor and injustice in the deep South.",
    price: 249, discountPercent: 0,
    categorySlug: 'fiction', brandSlug: 'harpercollins',
    rating: 4.8, reviewCount: 2109, format: 'Paperback',
  },
  {
    isbn: '978-1000000020',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    description: 'Between life and death there is a library, and the shelves go on forever.',
    price: 379, discountPercent: 0,
    categorySlug: 'fiction', brandSlug: 'harpercollins',
    rating: 4.4, reviewCount: 1543, format: 'Paperback',
  },

  // ── Science ──
  {
    isbn: '978-1000000021',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    description: 'From the Big Bang to black holes, an exploration of the universe.',
    price: 299, discountPercent: 0,
    categorySlug: 'science', brandSlug: 'simon-schuster',
    rating: 4.5, reviewCount: 1678, format: 'Paperback',
  },
  {
    isbn: '978-1000000022',
    title: 'The Selfish Gene',
    author: 'Richard Dawkins',
    description: 'A revolutionary exploration of evolution and the gene-centred view of life.',
    price: 349, discountPercent: 5,
    categorySlug: 'science', brandSlug: 'oxford-university-press',
    rating: 4.4, reviewCount: 876, format: 'Paperback',
  },
  {
    isbn: '978-1000000023',
    title: 'Cosmos',
    author: 'Carl Sagan',
    description: 'A personal voyage through the universe — from the Big Bang to the present day.',
    price: 399, discountPercent: 0,
    categorySlug: 'science', brandSlug: 'penguin-random-house',
    rating: 4.7, reviewCount: 1234, format: 'Hardcover',
  },

  // ── History ──
  {
    isbn: '978-1000000024',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    description: 'A brief history of humankind from the Stone Age to the present.',
    price: 449, discountPercent: 15,
    categorySlug: 'history', brandSlug: 'harpercollins',
    rating: 4.7, reviewCount: 1876, format: 'Paperback',
  },
  {
    isbn: '978-1000000025',
    title: 'Guns, Germs, and Steel',
    author: 'Jared Diamond',
    description: 'Why some civilisations came to dominate others throughout history.',
    price: 419, discountPercent: 10,
    categorySlug: 'history', brandSlug: 'simon-schuster',
    rating: 4.5, reviewCount: 987, format: 'Paperback',
  },

  // ── Mystery ──
  {
    isbn: '978-1000000026',
    title: 'The Hound of the Baskervilles',
    author: 'Arthur Conan Doyle',
    description: 'Sherlock Holmes investigates a supernatural hound terrorising a noble family.',
    price: 199, discountPercent: 0,
    categorySlug: 'mystery', brandSlug: 'penguin-random-house',
    rating: 4.7, reviewCount: 2134, format: 'Paperback',
  },
  {
    isbn: '978-1000000027',
    title: 'Gone Girl',
    author: 'Gillian Flynn',
    description: "On their fifth anniversary, Nick Dunne's wife Amy suddenly disappears.",
    price: 349, discountPercent: 10,
    categorySlug: 'mystery', brandSlug: 'harpercollins',
    rating: 4.3, reviewCount: 1567, format: 'Paperback',
  },
  {
    isbn: '978-1000000028',
    title: 'And Then There Were None',
    author: 'Agatha Christie',
    description: 'Ten strangers are trapped on an island, and one by one they are murdered.',
    price: 249, discountPercent: 5,
    categorySlug: 'mystery', brandSlug: 'harpercollins',
    rating: 4.8, reviewCount: 3210, format: 'Paperback',
  },

  // ── Science Fiction ──
  {
    isbn: '978-1000000029',
    title: 'Dune',
    author: 'Frank Herbert',
    description: 'An epic tale of politics, religion, and survival on the desert planet Arrakis.',
    price: 449, discountPercent: 0,
    categorySlug: 'science-fiction', brandSlug: 'simon-schuster',
    rating: 4.8, reviewCount: 2987, format: 'Paperback',
  },
  {
    isbn: '978-1000000030',
    title: 'The Hitchhiker\'s Guide to the Galaxy',
    author: 'Douglas Adams',
    description: 'Seconds before the Earth is demolished, Arthur Dent is whisked into space.',
    price: 299, discountPercent: 0,
    categorySlug: 'science-fiction', brandSlug: 'penguin-random-house',
    rating: 4.7, reviewCount: 2456, format: 'Paperback',
  },
  {
    isbn: '978-1000000031',
    title: 'Ender\'s Game',
    author: 'Orson Scott Card',
    description: 'Young Ender Wiggin is trained in zero-gravity combat to fight alien invaders.',
    price: 329, discountPercent: 8,
    categorySlug: 'science-fiction', brandSlug: 'harpercollins',
    rating: 4.6, reviewCount: 1876, format: 'Paperback',
  },

  // ── Fantasy ──
  {
    isbn: '978-1000000032',
    title: 'The Fellowship of the Ring',
    author: 'J.R.R. Tolkien',
    description: 'The first part of the epic quest to destroy the One Ring.',
    price: 499, discountPercent: 0,
    categorySlug: 'fantasy', brandSlug: 'harpercollins',
    rating: 4.9, reviewCount: 4532, format: 'Paperback',
  },
  {
    isbn: '978-1000000033',
    title: 'Harry Potter and the Sorcerer\'s Stone',
    author: 'J.K. Rowling',
    description: 'A young boy discovers he is a wizard and begins his journey at Hogwarts.',
    price: 399, discountPercent: 10,
    categorySlug: 'fantasy', brandSlug: 'simon-schuster',
    rating: 4.9, reviewCount: 5678, format: 'Paperback',
  },
  {
    isbn: '978-1000000034',
    title: 'The Name of the Wind',
    author: 'Patrick Rothfuss',
    description: 'The riveting first-person narrative of Kvothe, a legendary wizard.',
    price: 429, discountPercent: 5,
    categorySlug: 'fantasy', brandSlug: 'penguin-random-house',
    rating: 4.7, reviewCount: 1432, format: 'Paperback',
  },

  // ── Biography ──
  {
    isbn: '978-1000000035',
    title: 'Steve Jobs',
    author: 'Walter Isaacson',
    description: 'The exclusive biography of Apple co-founder Steve Jobs.',
    price: 499, discountPercent: 10,
    categorySlug: 'biography', brandSlug: 'simon-schuster',
    rating: 4.6, reviewCount: 2134, format: 'Hardcover',
  },
  {
    isbn: '978-1000000036',
    title: 'Elon Musk',
    author: 'Walter Isaacson',
    description: "An intimate portrait of the world's most daring entrepreneur.",
    price: 549, discountPercent: 5,
    categorySlug: 'biography', brandSlug: 'simon-schuster',
    rating: 4.4, reviewCount: 1876, format: 'Hardcover',
  },
  {
    isbn: '978-1000000037',
    title: 'Long Walk to Freedom',
    author: 'Nelson Mandela',
    description: "The autobiography of one of the twentieth century's greatest leaders.",
    price: 449, discountPercent: 0,
    categorySlug: 'biography', brandSlug: 'harpercollins',
    rating: 4.8, reviewCount: 1543, format: 'Paperback',
  },

  // ── Romance ──
  {
    isbn: '978-1000000038',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    description: 'The timeless story of Elizabeth Bennet and the proud Mr. Darcy.',
    price: 199, discountPercent: 0,
    categorySlug: 'romance', brandSlug: 'penguin-random-house',
    rating: 4.7, reviewCount: 3456, format: 'Paperback',
  },
  {
    isbn: '978-1000000039',
    title: 'The Notebook',
    author: 'Nicholas Sparks',
    description: 'An old man reads a love story from a faded notebook to an elderly woman.',
    price: 299, discountPercent: 5,
    categorySlug: 'romance', brandSlug: 'harpercollins',
    rating: 4.3, reviewCount: 1234, format: 'Paperback',
  },

  // ── Children's ──
  {
    isbn: '978-1000000040',
    title: 'Charlotte\'s Web',
    author: 'E.B. White',
    description: 'The story of a friendship between a pig named Wilbur and a spider named Charlotte.',
    price: 199, discountPercent: 0,
    categorySlug: 'children', brandSlug: 'harpercollins',
    rating: 4.8, reviewCount: 2109, format: 'Paperback',
  },
  {
    isbn: '978-1000000041',
    title: 'The Very Hungry Caterpillar',
    author: 'Eric Carle',
    description: 'A beloved classic following a caterpillar on a colourful eating adventure.',
    price: 149, discountPercent: 0,
    categorySlug: 'children', brandSlug: 'penguin-random-house',
    rating: 4.9, reviewCount: 4321, format: 'Hardcover',
  },

  // ── Young Adult ──
  {
    isbn: '978-1000000042',
    title: 'The Hunger Games',
    author: 'Suzanne Collins',
    description: 'In a dystopian future, teenagers fight to the death in televised games.',
    price: 349, discountPercent: 10,
    categorySlug: 'young-adult', brandSlug: 'simon-schuster',
    rating: 4.6, reviewCount: 3456, format: 'Paperback',
  },
  {
    isbn: '978-1000000043',
    title: 'The Fault in Our Stars',
    author: 'John Green',
    description: 'Two teenagers with cancer fall in love and embark on a journey to Amsterdam.',
    price: 299, discountPercent: 5,
    categorySlug: 'young-adult', brandSlug: 'penguin-random-house',
    rating: 4.5, reviewCount: 2876, format: 'Paperback',
  },
  {
    isbn: '978-1000000044',
    title: 'Divergent',
    author: 'Veronica Roth',
    description: 'In a society divided by factions, one girl discovers she does not fit in anywhere.',
    price: 329, discountPercent: 8,
    categorySlug: 'young-adult', brandSlug: 'harpercollins',
    rating: 4.3, reviewCount: 1987, format: 'Paperback',
  },

  // ── Non-fiction ──
  {
    isbn: '978-1000000045',
    title: 'Educated',
    author: 'Tara Westover',
    description: 'A memoir about a woman who grew up in a survivalist family and pursued education.',
    price: 369, discountPercent: 0,
    categorySlug: 'non-fiction', brandSlug: 'penguin-random-house',
    rating: 4.7, reviewCount: 2134, format: 'Paperback',
  },
  {
    isbn: '978-1000000046',
    title: 'The Body Keeps the Score',
    author: 'Bessel van der Kolk',
    description: 'How trauma reshapes body and brain, and innovative treatments for recovery.',
    price: 419, discountPercent: 0,
    categorySlug: 'non-fiction', brandSlug: 'penguin-random-house',
    rating: 4.8, reviewCount: 1987, format: 'Paperback',
  },
  {
    isbn: '978-1000000047',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    description: 'How two systems of thinking shape our judgments and decisions.',
    price: 449, discountPercent: 10,
    categorySlug: 'non-fiction', brandSlug: 'simon-schuster',
    rating: 4.6, reviewCount: 1654, format: 'Paperback',
  },

  // ── Memoir ──
  {
    isbn: '978-1000000048',
    title: 'The Glass Castle',
    author: 'Jeannette Walls',
    description: 'A memoir of resilience, survival, and an unconventional nomadic childhood.',
    price: 329, discountPercent: 0,
    categorySlug: 'memoir', brandSlug: 'simon-schuster',
    rating: 4.5, reviewCount: 1432, format: 'Paperback',
  },
  {
    isbn: '978-1000000049',
    title: 'I Am Malala',
    author: 'Malala Yousafzai',
    description: 'The story of a girl who stood up for education and was shot by the Taliban.',
    price: 349, discountPercent: 5,
    categorySlug: 'memoir', brandSlug: 'harpercollins',
    rating: 4.7, reviewCount: 1876, format: 'Paperback',
  },
  {
    isbn: '978-1000000050',
    title: 'Becoming',
    author: 'Michelle Obama',
    description: 'An intimate account of Michelle Obama\'s journey from Chicago\'s South Side to the White House.',
    price: 449, discountPercent: 0,
    categorySlug: 'memoir', brandSlug: 'penguin-random-house',
    rating: 4.8, reviewCount: 3210, format: 'Hardcover',
  },

  // ── Travel ──
  {
    isbn: '978-1000000051',
    title: 'In a Sunburned Country',
    author: 'Bill Bryson',
    description: 'A hilarious journey through Australia\'s vast, sun-baked landscape.',
    price: 299, discountPercent: 0,
    categorySlug: 'travel', brandSlug: 'penguin-random-house',
    rating: 4.5, reviewCount: 876, format: 'Paperback',
  },
  {
    isbn: '978-1000000052',
    title: 'Eat Pray Love',
    author: 'Elizabeth Gilbert',
    description: 'A woman\'s search for self-discovery across Italy, India, and Indonesia.',
    price: 319, discountPercent: 10,
    categorySlug: 'travel', brandSlug: 'harpercollins',
    rating: 4.2, reviewCount: 1234, format: 'Paperback',
  },
  {
    isbn: '978-1000000053',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    description: 'A young shepherd\'s journey across the Egyptian desert in search of treasure.',
    price: 249, discountPercent: 0,
    categorySlug: 'travel', brandSlug: 'harpercollins',
    rating: 4.6, reviewCount: 4321, format: 'Paperback',
  },

  // ── Cooking ──
  {
    isbn: '978-1000000054',
    title: 'Salt, Fat, Acid, Heat',
    author: 'Samin Nosrat',
    description: 'Mastering the four elements of good cooking through simple principles.',
    price: 549, discountPercent: 5,
    categorySlug: 'cooking', brandSlug: 'simon-schuster',
    rating: 4.7, reviewCount: 1543, format: 'Hardcover',
  },
  {
    isbn: '978-1000000055',
    title: 'The Joy of Cooking',
    author: 'Irma Rombauer',
    description: 'The all-purpose cookbook that has guided generations of home cooks.',
    price: 649, discountPercent: 0,
    categorySlug: 'cooking', brandSlug: 'simon-schuster',
    rating: 4.8, reviewCount: 2109, format: 'Hardcover',
  },
  {
    isbn: '978-1000000056',
    title: 'Indian Food Wisdom',
    author: 'Neha Sharma',
    description: 'Traditional Indian recipes with the science behind spices and health.',
    price: 399, discountPercent: 10,
    categorySlug: 'cooking', brandSlug: 'penguin-random-house',
    rating: 4.5, reviewCount: 765, format: 'Hardcover',
  },

  // ── Comics & Graphic Novels ──
  {
    isbn: '978-1000000057',
    title: 'Watchmen',
    author: 'Alan Moore',
    description: 'A groundbreaking graphic novel set in an alternate 1985 where superheroes exist.',
    price: 599, discountPercent: 0,
    categorySlug: 'comics', brandSlug: 'penguin-random-house',
    rating: 4.8, reviewCount: 1987, format: 'Paperback',
  },
  {
    isbn: '978-1000000058',
    title: 'Maus',
    author: 'Art Spiegelman',
    description: 'A Pulitzer-winning graphic novel depicting the Holocaust through mice and cats.',
    price: 499, discountPercent: 5,
    categorySlug: 'comics', brandSlug: 'penguin-random-house',
    rating: 4.9, reviewCount: 1543, format: 'Paperback',
  },
  {
    isbn: '978-1000000059',
    title: 'Persepolis',
    author: 'Marjane Satrapi',
    description: 'An autobiographical graphic novel about growing up in Iran during the Revolution.',
    price: 449, discountPercent: 0,
    categorySlug: 'comics', brandSlug: 'harpercollins',
    rating: 4.7, reviewCount: 1123, format: 'Paperback',
  },

  // ── Poetry ──
  {
    isbn: '978-1000000060',
    title: 'The Sun and Her Flowers',
    author: 'Rupi Kaur',
    description: 'A journey of wilting, falling, rooting, rising, and blooming.',
    price: 299, discountPercent: 0,
    categorySlug: 'poetry', brandSlug: 'simon-schuster',
    rating: 4.5, reviewCount: 1876, format: 'Paperback',
  },
  {
    isbn: '978-1000000061',
    title: 'Milk and Honey',
    author: 'Rupi Kaur',
    description: 'A collection of poetry about survival, abuse, love, loss, and femininity.',
    price: 249, discountPercent: 10,
    categorySlug: 'poetry', brandSlug: 'simon-schuster',
    rating: 4.4, reviewCount: 2345, format: 'Paperback',
  },
  {
    isbn: '978-1000000062',
    title: 'Leaves of Grass',
    author: 'Walt Whitman',
    description: 'A landmark collection celebrating democracy, nature, love, and friendship.',
    price: 199, discountPercent: 0,
    categorySlug: 'poetry', brandSlug: 'oxford-university-press',
    rating: 4.3, reviewCount: 876, format: 'Paperback',
  },

  // ── Drama ──
  {
    isbn: '978-1000000063',
    title: 'Hamlet',
    author: 'William Shakespeare',
    description: 'The timeless tragedy of a prince\'s quest to avenge his father\'s murder.',
    price: 149, discountPercent: 0,
    categorySlug: 'drama', brandSlug: 'oxford-university-press',
    rating: 4.7, reviewCount: 2876, format: 'Paperback',
  },
  {
    isbn: '978-1000000064',
    title: 'A Streetcar Named Desire',
    author: 'Tennessee Williams',
    description: 'A southern belle clashes with her brutish brother-in-law in New Orleans.',
    price: 199, discountPercent: 5,
    categorySlug: 'drama', brandSlug: 'penguin-random-house',
    rating: 4.5, reviewCount: 987, format: 'Paperback',
  },
  {
    isbn: '978-1000000065',
    title: 'Death of a Salesman',
    author: 'Arthur Miller',
    description: 'Willy Loman\'s tragic pursuit of the American dream and its devastating cost.',
    price: 199, discountPercent: 0,
    categorySlug: 'drama', brandSlug: 'penguin-random-house',
    rating: 4.6, reviewCount: 1123, format: 'Paperback',
  },

  // ── Philosophy ──
  {
    isbn: '978-1000000066',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    description: 'Private notes of a Roman emperor on Stoic philosophy and self-discipline.',
    price: 199, discountPercent: 0,
    categorySlug: 'philosophy', brandSlug: 'oxford-university-press',
    rating: 4.8, reviewCount: 2345, format: 'Paperback',
  },
  {
    isbn: '978-1000000067',
    title: 'The Republic',
    author: 'Plato',
    description: 'Plato\'s exploration of justice, order, and character in Athens.',
    price: 249, discountPercent: 0,
    categorySlug: 'philosophy', brandSlug: 'oxford-university-press',
    rating: 4.5, reviewCount: 1234, format: 'Paperback',
  },
  {
    isbn: '978-1000000068',
    title: 'Nicomachean Ethics',
    author: 'Aristotle',
    description: 'Aristotle\'s foundational work on virtue, happiness, and the good life.',
    price: 229, discountPercent: 5,
    categorySlug: 'philosophy', brandSlug: 'oxford-university-press',
    rating: 4.4, reviewCount: 876, format: 'Paperback',
  },

  // ── Religion ──
  {
    isbn: '978-1000000069',
    title: 'The Bhagavad Gita',
    author: 'Swami Vivekananda',
    description: 'A philosophical and religious dialogue between Prince Arjuna and Krishna.',
    price: 149, discountPercent: 0,
    categorySlug: 'religion', brandSlug: 'penguin-random-house',
    rating: 4.9, reviewCount: 4321, format: 'Paperback',
  },
  {
    isbn: '978-1000000070',
    title: 'The Power of Faith',
    author: 'Norman Vincent Peale',
    description: 'How positive thinking and faith can transform every aspect of your life.',
    price: 249, discountPercent: 10,
    categorySlug: 'religion', brandSlug: 'simon-schuster',
    rating: 4.5, reviewCount: 1234, format: 'Paperback',
  },
  {
    isbn: '978-1000000071',
    title: 'The Monk Who Sold His Ferrari',
    author: 'Robin Sharma',
    description: 'A life-changing fable about fulfilling your dreams and reaching your destiny.',
    price: 299, discountPercent: 0,
    categorySlug: 'religion', brandSlug: 'harpercollins',
    rating: 4.3, reviewCount: 2109, format: 'Paperback',
  },

  // ── Language Learning ──
  {
    isbn: '978-1000000072',
    title: 'Fluent in 3 Months',
    author: 'Benny Lewis',
    description: 'How anyone at any age can learn to speak any language anywhere in the world.',
    price: 349, discountPercent: 5,
    categorySlug: 'language-learning', brandSlug: 'harpercollins',
    rating: 4.2, reviewCount: 876, format: 'Paperback',
  },
  {
    isbn: '978-1000000073',
    title: 'The Story of Language',
    author: 'Mario Pei',
    description: 'A fascinating account of language origins, development and diversity.',
    price: 299, discountPercent: 0,
    categorySlug: 'language-learning', brandSlug: 'simon-schuster',
    rating: 4.4, reviewCount: 543, format: 'Paperback',
  },
  {
    isbn: '978-1000000074',
    title: 'Word Power Made Easy',
    author: 'Norman Lewis',
    description: 'The complete handbook for building a superior vocabulary quickly.',
    price: 199, discountPercent: 10,
    categorySlug: 'language-learning', brandSlug: 'penguin-random-house',
    rating: 4.6, reviewCount: 3210, format: 'Paperback',
  },

  // ── Thriller (more) ──
  {
    isbn: '978-1000000075',
    title: 'The Girl with the Dragon Tattoo',
    author: 'Stieg Larsson',
    description: 'A journalist and hacker investigate a decades-old disappearance in Sweden.',
    price: 399, discountPercent: 0,
    categorySlug: 'thriller', brandSlug: 'penguin-random-house',
    rating: 4.5, reviewCount: 1987, format: 'Paperback',
  },
  {
    isbn: '978-1000000076',
    title: 'The Da Vinci Code',
    author: 'Dan Brown',
    description: 'A murder inside the Louvre reveals a shocking secret of Christianity.',
    price: 349, discountPercent: 8,
    categorySlug: 'thriller', brandSlug: 'simon-schuster',
    rating: 4.2, reviewCount: 2876, format: 'Paperback',
  },
];

async function main() {
  console.log('Seeding database...');

  // ── 1. Categories (all 20 sidebar items) ──
  const categoryDefs = [
    { name: 'Fiction',                slug: 'fiction',          description: 'Novels, stories and contemporary fiction' },
    { name: 'Business',               slug: 'business',         description: 'Business, management and entrepreneurship' },
    { name: 'Technology',             slug: 'technology',       description: 'Programming, software and computer science' },
    { name: 'Self Help',              slug: 'self-help',        description: 'Personal development and productivity' },
    { name: 'Science',                slug: 'science',          description: 'Popular science and academic reading' },
    { name: 'Non-fiction',            slug: 'non-fiction',      description: 'True stories, essays and journalism' },
    { name: 'Thriller',               slug: 'thriller',         description: 'Suspense, mystery and crime fiction' },
    { name: 'Romance',                slug: 'romance',          description: 'Love stories and romantic fiction' },
    { name: "Children's",             slug: 'children',         description: 'Books for young readers' },
    { name: 'History',                slug: 'history',          description: 'Historical events and biographies' },
    { name: 'Mystery',                slug: 'mystery',          description: 'Whodunits, detective stories and crime mysteries' },
    { name: 'Science Fiction',        slug: 'science-fiction',  description: 'Futuristic worlds, space, and speculative fiction' },
    { name: 'Fantasy',                slug: 'fantasy',          description: 'Magic, mythical creatures and imaginary worlds' },
    { name: 'Biography',              slug: 'biography',        description: 'Life stories of inspiring individuals' },
    { name: 'Memoir',                 slug: 'memoir',           description: 'Personal narratives and autobiographies' },
    { name: 'Travel',                 slug: 'travel',           description: 'Adventures, journeys and travel writing' },
    { name: 'Cooking',                slug: 'cooking',          description: 'Recipes, food culture and culinary arts' },
    { name: 'Comics & Graphic Novels',slug: 'comics',           description: 'Graphic novels, manga and illustrated stories' },
    { name: 'Poetry',                 slug: 'poetry',           description: 'Verse, lyric and spoken word collections' },
    { name: 'Drama',                  slug: 'drama',            description: 'Stage plays and theatrical works' },
    { name: 'Philosophy',             slug: 'philosophy',       description: 'Ethics, metaphysics and critical thinking' },
    { name: 'Religion',               slug: 'religion',         description: 'Spirituality, faith and religious texts' },
    { name: 'Young Adult',            slug: 'young-adult',      description: 'Books for teens and young adults' },
    { name: 'Language Learning',      slug: 'language-learning',description: 'Grammar, vocabulary and language guides' },
  ];

  const categories = [];
  for (const c of categoryDefs) {
    const cat = await prisma.category.upsert({ where: { slug: c.slug }, update: { name: c.name }, create: c });
    categories.push(cat);
  }
  console.log(`  ✓ ${categories.length} categories`);

  // ── 2. Brands / Publishers ──
  const brandDefs = [
    { name: 'Penguin Random House',   slug: 'penguin-random-house' },
    { name: 'HarperCollins',          slug: 'harpercollins' },
    { name: "O'Reilly Media",         slug: 'oreilly-media' },
    { name: 'Simon & Schuster',       slug: 'simon-schuster' },
    { name: 'Oxford University Press',slug: 'oxford-university-press' },
  ];
  const brands = [];
  for (const b of brandDefs) {
    const brand = await prisma.brand.upsert({ where: { slug: b.slug }, update: { name: b.name }, create: b });
    brands.push(brand);
  }
  console.log(`  ✓ ${brands.length} brands`);

  // ── 3. Users ──
  const passwordHash = await bcrypt.hash('password123', 10);
  const users = [];
  for (const u of [
    { fullName: 'Priyanshu Demo', email: 'priyanshu@example.com', giftPoints: 850 },
    { fullName: 'Ananya Sharma',  email: 'ananya@example.com',    giftPoints: 420 },
  ]) {
    const user = await prisma.user.upsert({ where: { email: u.email }, update: {}, create: { ...u, passwordHash } });
    users.push(user);
  }

  // Carts
  for (const user of users) {
    await prisma.cart.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } });
  }

  // ── 4. Delete old products (clears duplicates from earlier runs) ──
  await prisma.orderItem.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.product.deleteMany({});

  // ── 5. Seed products ──
  const baseDate = new Date('2024-01-01T00:00:00Z');
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 4);

  let created = 0;
  for (let i = 0; i < BOOKS.length; i++) {
    const book = BOOKS[i];
    const cat = categories.find(c => c.slug === book.categorySlug);
    const brand = brands.find(b => b.slug === book.brandSlug);
    if (!cat || !brand) {
      console.warn(`  ⚠ Skipping "${book.title}" — category "${book.categorySlug}" or brand "${book.brandSlug}" not found`);
      continue;
    }
    const createdAt = new Date(baseDate.getTime() + i * 60 * 1000);
    await prisma.product.create({
      data: {
        title: book.title,
        author: book.author,
        description: book.description,
        isbn: book.isbn,
        price: book.price,
        discountPercent: book.discountPercent,
        stockQuantity: 50 + (i * 7 % 40),
        format: book.format || 'Paperback',
        tentativeDeliveryDate: deliveryDate,
        rating: book.rating,
        reviewCount: book.reviewCount,
        categoryId: cat.id,
        brandId: brand.id,
        createdAt,
        updatedAt: createdAt,
      },
    });
    created++;
  }

  console.log(`  ✓ ${created} books seeded across ${categoryDefs.length} categories`);
  console.log('\nSeeding complete!');
  console.log('Demo login: priyanshu@example.com / password123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
