// Constants
const API_KEY = 'AIzaSyBDglAtK_lUl6DFoWyPd-k3e2SZC13qUrQ';
const currentUser = {
    login: 'kingslayer458',
    readingList: new Set(),
    reviews: []
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setupThemeToggle();
    setupSearchHandlers();
    updateDateTime();
    setInterval(updateDateTime, 1000);
}

// Date Time Management
function updateDateTime() {
    const timeDisplay = document.querySelector('.time-display');
    if (timeDisplay) {
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
        timeDisplay.textContent = `${formattedDate} UTC`;
    }
}

// Theme Management
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const icon = themeToggle.querySelector('i');
    if (icon) {
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

// Search Functionality
function setupSearchHandlers() {
    const searchInput = document.getElementById('searchInput');
    const clearButton = document.getElementById('clearSearch');
    const searchBtn = document.querySelector('.search-btn');

    if (!searchInput || !clearButton || !searchBtn) return;

    // Input handler
    searchInput.addEventListener('input', () => {
        clearButton.style.display = searchInput.value ? 'block' : 'none';
    });

    // Clear button handler
    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        clearButton.style.display = 'none';
        searchInput.focus();
    });

    // Enter key handler
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBooks();
        }
    });
}

// Search Books Function
async function searchBooks() {
    const searchInput = document.getElementById('searchInput');
    const resultsDiv = document.getElementById('results');
    
    if (!searchInput || !resultsDiv) return;

    const query = searchInput.value.trim();
    if (!query) return;

    showLoadingAnimation(resultsDiv);

    try {
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${API_KEY}&maxResults=20`
        );
        const data = await response.json();

        if (!data.items) {
            showNoResultsMessage(resultsDiv);
            updateStats(0, 0);
            return;
        }

        displayResults(data.items);
        updateStats(data.items.length, calculateAverageRating(data.items));
    } catch (error) {
        showErrorMessage(resultsDiv, error);
    }
}

// Display Functions
function showLoadingAnimation(container) {
    container.innerHTML = `
        <div class="loading-animation">
            <div class="spinner"></div>
            <p>Searching for books...</p>
        </div>
    `;
}

function showNoResultsMessage(container) {
    container.innerHTML = `
        <div class="no-results">
            <i class="fas fa-search"></i>
            <h3>No books found</h3>
            <p>Try different keywords or check your spelling</p>
        </div>
    `;
}

function showErrorMessage(container, error) {
    container.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <h3>Oops! Something went wrong</h3>
            <p>Please try again later</p>
        </div>
    `;
    console.error('Search error:', error);
}

function displayResults(books) {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;

    resultsDiv.innerHTML = '';

    books.forEach((book, index) => {
        const bookCard = createBookCard(book, index);
        resultsDiv.appendChild(bookCard);
    });
}

function createBookCard(book, index) {
    const bookDiv = document.createElement('div');
    bookDiv.className = 'book-card animate-slide-up';
    bookDiv.style.animationDelay = `${index * 0.1}s`;

    const imageUrl = book.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=No+Cover';
    const title = book.volumeInfo.title || 'Untitled';
    const authors = book.volumeInfo.authors?.join(", ") || "Unknown Author";
    const rating = book.volumeInfo.averageRating || 0;

    bookDiv.innerHTML = `
        <div class="book-cover">
            <img src="${imageUrl}" alt="${title}" loading="lazy">
        </div>
        <div class="book-info">
            <h3 class="book-title">${title}</h3>
            <p class="book-author">${authors}</p>
            <div class="book-rating">
                ${generateRatingStars(rating)}
            </div>
            <button class="view-details-btn" onclick="viewBookDetails('${book.id}')">
                View Details
            </button>
        </div>
    `;

    return bookDiv;
}

// Utility Functions
function generateRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return `
        ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
        ${hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
        ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
        <span class="rating-text">(${rating.toFixed(1)})</span>
    `;
}

function calculateAverageRating(books) {
    const ratings = books
        .map(book => book.volumeInfo.averageRating || 0)
        .filter(rating => rating > 0);

    if (ratings.length === 0) return 0;
    return ratings.reduce((a, b) => a + b) / ratings.length;
}

function updateStats(booksCount, avgRating) {
    const booksFoundElement = document.getElementById('booksFound');
    const avgRatingElement = document.getElementById('avgRating');
    const readingListElement = document.getElementById('readingListCount');

    if (booksFoundElement) booksFoundElement.textContent = booksCount;
    if (avgRatingElement) avgRatingElement.textContent = avgRating.toFixed(1);
    if (readingListElement) readingListElement.textContent = currentUser.readingList.size;
}

// Update the viewBookDetails function in your script.js
async function viewBookDetails(bookId) {
    const modal = document.getElementById('bookModal');
    const modalContent = modal.querySelector('.modal-body');
    
    // Show modal and loading state
    modal.classList.add('active');
    modalContent.innerHTML = `
        <div class="modal-loading">
            <div class="book-loader">
                <div class="book">
                    <div class="book-page"></div>
                    <div class="book-page"></div>
                    <div class="book-page"></div>
                </div>
            </div>
            <p>Loading book details...</p>
        </div>
    `;

    try {
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${API_KEY}`
        );
        const book = await response.json();
        
        displayBookModal(book, modalContent);
    } catch (error) {
        modalContent.innerHTML = `
            <div class="modal-error">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error loading book details</h3>
                <p>Please try again later</p>
            </div>
        `;
    }
}

function displayBookModal(book, modalContent) {
    const {
        title,
        authors = ['Unknown Author'],
        description = 'No description available',
        imageLinks = {},
        categories = [],
        publishedDate,
        publisher,
        pageCount,
        averageRating = 0,
        ratingsCount = 0
    } = book.volumeInfo;

    modalContent.innerHTML = `
        <div class="modal-grid">
            <div class="modal-left">
                <img src="${imageLinks.thumbnail || 'https://via.placeholder.com/128x192?text=No+Cover'}" 
                     alt="${title}" class="modal-book-cover">
                <div class="book-meta">
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${publishedDate || 'Unknown date'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-book"></i>
                        <span>${pageCount ? `${pageCount} pages` : 'Unknown pages'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-building"></i>
                        <span>${publisher || 'Unknown publisher'}</span>
                    </div>
                </div>
            </div>
            <div class="modal-right">
                <h2>${title}</h2>
                <p class="modal-authors">${authors.join(', ')}</p>
                <div class="modal-rating">
                    ${generateRatingStars(averageRating)}
                    <span class="rating-count">${ratingsCount} ratings</span>
                </div>
                <div class="modal-categories">
                    ${categories.map(category => `<span class="category-tag">${category}</span>`).join('')}
                </div>
                <div class="modal-description">
                    <h3>About this book</h3>
                    <p>${description}</p>
                </div>
            </div>
        </div>
    `;
}

// Add these event listeners after your existing code
document.addEventListener('DOMContentLoaded', () => {
    // Close modal when clicking outside or on close button
    const modal = document.getElementById('bookModal');
    const closeBtn = modal.querySelector('.modal-close');

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
});

// Filter Functions
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        // Implement filtering logic here
    });
});

// Hide preloader when page is loaded
window.addEventListener('load', function() {
    const preloader = document.querySelector('.preloader');
    setTimeout(function() {
        preloader.classList.add('hidden');
    }, 1000); // Wait 1 second before hiding
});

// Search clear button functionality
const searchInput = document.querySelector('.search-box input');
const clearBtn = document.querySelector('.clear-btn');

// Show/hide clear button based on input content
searchInput.addEventListener('input', function() {
    if (this.value.length > 0) {
        clearBtn.classList.remove('hidden');
    } else {
        clearBtn.classList.add('hidden');
    }
});

// Clear input when button is clicked
clearBtn.addEventListener('click', function() {
    searchInput.value = '';
    clearBtn.classList.add('hidden');
    searchInput.focus();
});