import axios from 'axios';
import notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = 'codeishidden';
const PER_PAGE = 40;
const form = document.querySelector('form');
const input = form.querySelector('input');
const resultsDiv = document.getElementById('results');
const lightbox = new SimpleLightbox('.lightbox');
let page = 1;
let searchTerm = '';

form.addEventListener('submit', async e => {
  e.preventDefault();
  searchTerm = input.value.trim();
  page = 1;
  clearGallery();
  performSearch();
});

function clearGallery() {
  const galleryDiv = document.querySelector('.gallery');
  galleryDiv.innerHTML = '';
}

async function performSearch() {
  try {
    const { hits, totalHits } = await searchImages(searchTerm, page);
    displayImages(hits, totalHits);
    if (totalHits === 0) {
      displayNoResultsNotification();
    }
  } catch (error) {
    console.log(error);
    notiflix.Notify.failure('Wystąpił błąd podczas pobierania danych.');
  }
}

async function searchImages(term, page = 1) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: API_KEY,
        q: term,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: PER_PAGE,
        page: page,
      },
    });
    const data = response.data;
    const hits = data.hits;
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

function displayImages(images, totalHits) {
  const galleryDiv = document.querySelector('.gallery');

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
}

const displayNoResultsNotification = () => {
  notiflix.Notify.warning(
    'Sorry, there are no images matching your search query. Please try again.'
  );
};

window.addEventListener('scroll', () => {
  const totalScrollHeight = document.documentElement.scrollHeight;
  const windowHeight = window.innerHeight;
  const scrollableHeight = totalScrollHeight - windowHeight;

  if (scrollableHeight <= window.scrollY) {
    page++;
    performSearch();
  }
});
