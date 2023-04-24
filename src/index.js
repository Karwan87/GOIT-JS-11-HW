import axios from 'axios';
import notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

let searchTerm = '';
const pageSize = 40;
let page = 1;
const loadMoreButton = document.querySelector('.load-more');

const API_KEY = '35038868-0cefdd0904fdf8a70a3b6f6a2';
const PER_PAGE = 40;
const form = document.querySelector('form');
const input = form.querySelector('input');
const resultsDiv = document.getElementById('results');
const lightbox = new SimpleLightbox('.lightbox');
let isLoadMoreButtonCreated = false;
let isLoadingMore = false;

// pole wyszukiwania
form.addEventListener('submit', async e => {
  e.preventDefault();
  let searchTerm = input.value.trim();
  if (searchTerm !== '') {
    try {
      const { hits, totalHits } = await searchImages(searchTerm, page);
      console.log('Hits after fetching data:', hits && totalHits);
      if (hits && hits.length > 0) {
        console.log('Hits before calling displayImages:', hits) && totalHits;
        displayImages(hits, totalHits);
        if (totalHits > page * pageSize) {
          hideLoadMoreButton();
        } else {
          hideLoadMoreButton();
          notiflix.Notify.warning(
            "We're sorry, but you've reached the end of search results."
          );
        }
      } else {
        notiflix.Notify.failure(
          'Nie znaleziono żadnych obrazów dla podanego hasła.'
        );
      }
    } catch (error) {
      console.log(error);
      notiflix.Notify.failure('Wystąpił błąd podczas pobierania danych.');
    }
  }
});

// dodanie przycisku lub ukrycie
const showLoadMoreButton = () => {
  if (!isLoadMoreButtonCreated) {
    const button = document.createElement('button');
    button.classList.add('load-more');
    button.textContent = 'Load more';
    button.addEventListener('click', () => {
      isLoadingMore = true;
      page++;
      searchImages(searchTerm, page);
    });
    const container = document.querySelector('#results');
    container.appendChild(button);
    isLoadMoreButtonCreated = true;
  }
  const loadMoreButton = document.querySelector('.load-more');
  loadMoreButton.classList.remove('hidden');
};

const hideLoadMoreButton = () => {
  const loadMoreButton = document.querySelector('.load-more');
  if (loadMoreButton) {
    loadMoreButton.classList.add('hidden');
  }
};

const searchInput = document.querySelector('#search-input');
const searchButton = document.querySelector('#search-button');

searchInput.addEventListener('change', () => {
  page = 1;
});

// funkcjawywołująca searchImages (to co wyświetla strona)
async function searchImages(term, page = 1) {
  searchTerm = term;
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: API_KEY,
        q: searchTerm,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: PER_PAGE,
        page: page,
      },
    });
    const data = response.data;
    const hits = data.hits;
    hits.forEach(hit => {
      const imageElement = document.createElement('img');
      imageElement.src = hit.webformatURL;
      document.querySelector('.gallery').appendChild(imageElement);
    });
    console.log(hits);

    const lightbox = new SimpleLightbox('gallery-item');
    return {
      totalHits: data.totalHits,
      hits: hits,
    };
  } catch (error) {
    console.error(error);
    return {
      hits: [],
      totalHits: 0,
    };
  }
}

// jeśli nie ma więcej wyników to:
const displayNoResultsNotification = () => {
  notiflix.Notify.warning(
    'Sorry, there are no images matching your search query. Please try again.'
  );
};

function displayImages(images, totalHits) {
  const galleryDiv = document.querySelector('.gallery');
  galleryDiv.innerHTML = '';

  if (totalHits === 0) {
    displayNoResultsNotification();
    return;
  }

  images.forEach(image => {
    const card = document.createElement('div');
    card.classList.add('photo-card');

    const link = document.createElement('a');
    link.href = image.largeImageURL;

    const img = document.createElement('img');
    img.src = image.webformatURL;
    img.alt = image.tags;
    img.loading = 'lazy';
    img.classList.add('lightbox');

    const infoDiv = document.createElement('div');
    infoDiv.classList.add('info');
    const likes = document.createElement('p');
    likes.classList.add('info-item');
    likes.innerHTML = `<b>Likes:</b> ${image.likes}`;
    infoDiv.appendChild(likes);

    const views = document.createElement('p');
    views.classList.add('info-item');
    views.innerHTML = `<b>Views:</b> ${image.views}`;
    infoDiv.appendChild(views);

    const comments = document.createElement('p');
    comments.classList.add('info-item');
    comments.innerHTML = `<b>Comments:</b> ${image.comments}`;
    infoDiv.appendChild(comments);

    const downloads = document.createElement('p');
    downloads.classList.add('info-item');
    downloads.innerHTML = `<b>Downloads:</b> ${image.downloads}`;
    infoDiv.appendChild(downloads);
    card.appendChild(link);
    link.appendChild(img);
    card.appendChild(infoDiv);
    galleryDiv.appendChild(card);
  });

  lightbox.refresh();

  const loadMoreButton = document.createElement('button');
  loadMoreButton.classList.add('load-more');
  loadMoreButton.textContent = 'Load More';

  if (totalHits > page * pageSize) {
    galleryDiv.appendChild(loadMoreButton);
  }

  loadMoreButton.addEventListener('click', async () => {
    page++;
    try {
      const { hits, totalHits } = await searchImages(searchTerm, page);
      displayImages(hits, totalHits);
    } catch (error) {
      console.log(error);
      notiflix.Notify.failure('Wystąpił błąd podczas pobierania danych.');
    }

    if (totalHits <= page * pageSize) {
      loadMoreButton.classList.add('hidden');
      notiflix.Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
    }
  });
  checkIfReachedEndOfResults(totalHits);
}

function checkIfReachedEndOfResults() {
  const gallery = document.querySelector('.gallery');
  const loadMoreButton = document.querySelector('.load-more');

  if (!loadMoreButton) {
    const galleryRect = gallery.getBoundingClientRect();
    const galleryBottom = galleryRect.top + galleryRect.height;

    if (window.innerHeight + window.pageYOffset >= galleryBottom) {
      const simulatedClick = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      loadMoreButton.dispatchEvent(simulatedClick);
    }
  }
}
