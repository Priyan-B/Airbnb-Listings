let allListings = []; 

async function loadListings() {
    const response = await fetch('airbnb_sf_listings_500.json');
    const data = await response.json();

    // Take only the first 50 listings
    allListings = data.slice(0, 50);
    displayListings(allListings);
}

// Function to display listings on the page
function displayListings(listings) {
    const container = document.getElementById('listings');
    container.innerHTML = ''; 

    listings.forEach(listing => {
        // Clean up description (remove HTML tags, show full text)
        let description = (listing.description)
            .replace(/<[^>]*>/g, ' ');
        // If description doesn't end with proper punctuation, add "..."
        // Had to do this because the description in json does not have a proper ending
        if (description.length > 100 && !/[.!?]$/.test(description.trim())) {
            description = description.trim() + '...';
        }

        // Get up to 5 amenities 
        let topAmenities = 'No amenities listed';
        if (listing.amenities) {
            const amenitiesArray = listing.amenities
                .replace(/[\[\]"]/g, '')         // remove all brackets and quotes
                .replace(/\\u2019/g, "'")        // fix apostrophes
                .replace(/\\u2013/g, '-')        // fix dashes
                .split(',')                      // split by comma
                .map(a => a.trim())              // trim spaces
                .filter(a => a.length > 0);      // remove empty entries
            topAmenities = amenitiesArray.slice(0, 5).join(', ');
        }

        // Build the listing card
        const article = document.createElement('article');
        article.className = 'listing';
        article.innerHTML = `
            <button class="favorite-btn" onclick="toggleFavorite(this)">🤍</button>
            <img class="thumbnail" src="${listing.picture_url}" alt="${listing.name}" />
            <h2>${listing.name}</h2>
            <div class="host">
                <img src="${listing.host_thumbnail_url}" alt="${listing.host_name}" />
                Hosted by ${listing.host_name}
            </div>
            <p class="price">${listing.price} / night</p>
            <p>⭐ ${listing.review_scores_rating || 'No rating'}</p>
            <p class="description">${description}</p>
            <p class="amenities"><strong>Amenities:</strong> ${topAmenities}</p>
        `;

        container.appendChild(article);
    });
}

// Favorite heart button toggle
function toggleFavorite(button) {
    if (button.textContent === '🤍') {
        button.textContent = '❤️';
    } else {
        button.textContent = '🤍';
    }
}

// Sort dropdown
document.getElementById('sortBox').addEventListener('change', function (e) {
    const sortBy = e.target.value;
    let sorted = [...allListings]; 

    if (sortBy === 'priceLow') {
        sorted.sort((a, b) => getPrice(a.price) - getPrice(b.price));
    } else if (sortBy === 'priceHigh') {
        sorted.sort((a, b) => getPrice(b.price) - getPrice(a.price));
    } else if (sortBy === 'rating') {
        sorted.sort((a, b) => (b.review_scores_rating || 0) - (a.review_scores_rating || 0));
    }

    displayListings(sorted);
});

// Helper(Turns $ into a numbers)
function getPrice(priceStr) {
    if (!priceStr) return 0;
    return parseFloat(priceStr.replace(/[$,]/g, ''));
}

loadListings();