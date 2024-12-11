import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import axios from "axios";

const apiKey = "47413838-05ed4088691502c79710d9d69";
const apiUrl = "https://pixabay.com/api/";
const gallery = document.querySelector(".gallery");
const searchForm = document.querySelector(".search-form");
const loader = document.querySelector(".loader-container");
const loadMoreBtn = document.querySelector(".load-more-btn");

let currentPage = 1;
let currentQuery = '';

searchForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    currentQuery = document.querySelector(".search-query").value;
    currentPage = 1;
    await searchImages(currentQuery);
});

loadMoreBtn.addEventListener("click", function () {
    currentPage++;
    searchImages(currentQuery, currentPage);
});

async function searchImages(query, page = 1) {
    loader.style.display = "flex";
    try {
        const response = await axios.get(apiUrl, {
            params: {
                key: apiKey,
                q: query,
                image_type: "photo",
                orientation: "horizontal",
                safesearch: true,
                page: page,
                per_page: 15
            },
        });

        const data = response.data;
        if (currentPage === 1) {
            gallery.innerHTML = ""; 
        }
        const q = query.trim();
        if (q === "") {
             showError("Sorry, there are no images matching your search query. Please try again!");
        return;
        }

        displayImages(data.hits);
        if (page * 15 >= data.totalHits) {
            loadMoreBtn.style.display = "none";
            showError("We're sorry, but you've reached the end of search results.");
        } else {
            loadMoreBtn.style.display = "block";
        }

        const cardHeight = gallery.querySelector(".image-card").getBoundingClientRect().height;
        window.scrollBy({
            top: cardHeight * 2,
            left: 0,
            behavior: "smooth",
        });

    } catch (error) {
        showError("An error occurred. Please try again.");
        console.error("Axios error:", error);

    } finally {
        loader.style.display = "none";
    }
}

function displayImages(images) {
    if (currentPage === 1) {
        gallery.innerHTML = "";
    }    

    images.forEach(function (image) {
        const card = document.createElement("div");
        card.classList.add("image-card");
        card.innerHTML = `
            <a href="${image.largeImageURL}" data-lightbox="gallery">
                <img src="${image.webformatURL}" alt="${image.tags}">
            </a>
            <div class="image-info">
                <p>Likes: ${image.likes}</p>
                <p>Views: ${image.views}</p>
                <p>Comments: ${image.comments}</p>
                <p>Downloads: ${image.downloads}</p>
            </div>
        `;
        gallery.appendChild(card);
    });

    const lightbox = new SimpleLightbox('.image-card a', {
        captionsData: 'alt',
        captionPosition: 'bottom',
        captionDelay: 250,
    });
    lightbox.refresh();
}

function showError(message) {
    iziToast.error({
        title: 'Error',
        message: message,
    });
}