import axios from 'axios';
import notiflix from 'notiflix';
import { searchImages } from './api.js';
import simpleLightbox from 'simplelightbox';
import '../node_modules/simplelightbox/dist/simple-lightbox.js';

let page = 1;
let searchTerm = '';
const pageSize = 40;

const displayNoResultsNotification = () => {
  notiflix.Notify.warning(
    'Sorry, there are no images matching your search query. Please try again.'
  );
};

const form = document.querySelector('form');
const input = form.querySelector('input');
const resultsDiv = document.getElementById('results');

function checkIfReachedEndOfResults() {
  const gallery = document.querySelector('.gallery');
  const loadMoreButton = document.querySelector('.load-more');

  if (loadMoreButton) {
    const galleryRect = gallery.getBoundingClientRect();
    const loadMoreButtonRect = loadMoreButton.getBoundingClientRect();

    if (galleryRect.bottom < loadMoreButtonRect.top) {
      loadMoreButton.click();
    }
  }
}

function displayImages(images, totalHits) {
  const galleryDiv = document.querySelector('.gallery');
  galleryDiv.innerHTML = '';

  if (totalHits === 0) {
    displayNoResultsNotification();
    return;
  }
  const lightbox = new simpleLightbox('.photo-card a');

  images.forEach(image => {
    const card = document.createElement('div');
    card.classList.add('photo-card');

    const link = document.createElement('a');
    link.href = image.largeImageURL;
    link.setAttribute('data-lighbox', 'gallery-item');

    const img = document.createElement('img');
    img.src = image.webformatURL;
    img.alt = image.tags;
    img.loading = 'lazy';
    card.appendChild(img);

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
    card.appendChild(infoDiv);
    galleryDiv.appendChild(card);
  });

  const loadMoreButton = document.createElement('button');
  loadMoreButton.classList.add('load-more');
  loadMoreButton.textContent = 'Load More';

  if (totalHits > page * pageSize) {
    galleryDiv.appendChild(loadMoreButton);
  }

  loadMoreButton.addEventListener('click', async () => {
    page++;
    try {
      const { hits, totalHits } = await searchImages(input.value, page);
      displayImages(hits, totalHits);
    } catch (error) {
      console.log(error);
      notiflix.Notify.failure('Wystąpił błąd podczas pobierania danych.');
    }

    if (totalHits <= page * pageSize) {
      loadMoreButton.style.display = 'none';
      notiflix.Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
    }
  });
  checkIfReachedEndOfResults(totalHits);
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  let searchTerm = input.value.trim();
  if (searchTerm !== '') {
    try {
      const { hits, totalHits } = await searchImages(searchTerm, page);
      console.log('Hits after fetching data:', hits);
      if (hits && hits.length > 0) {
        console.log('Hits before calling displayImages:', hits);
        displayImages(hits, totalHits);
        if (totalHits > page * 40) {
          loadMoreButton.classList.remove('hidden');
        } else {
          loadMoreButton.classList.add('hidden');
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

const loadMoreButton = document.querySelector('.load-more');
loadMoreButton.addEventListener('click', async () => {
  page++;
  let searchTerm = input.value.trim();
  try {
    const { hits, totalHits } = await searchImages(searchTerm, page);
    console.log('Hits after fetching data:', hits);
    if (hits && hits.length > 0) {
      console.log('Hits before calling displayImages:', hits);
      displayImages(hits, totalHits);
      if (totalHits <= page * 40) {
        loadMoreButton.classList.add('hidden');
        notiflix.Notify.warning(
          "We're sorry, but you've reached the end of search results."
        );
      }
    } else {
      loadMoreButton.classList.add('hidden');
      notiflix.Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (error) {
    console.log(error);
    notiflix.Notify.failure('Wystąpił błąd podczas pobierania danych.');
  }
});

window.addEventListener('scroll', async () => {
  const scrollPosition = window.innerHeight + window.pageYOffset;
  const bodyHeight = document.body.offsetHeight;
  const isScrollEnd = scrollPosition >= bodyHeight;

  if (
    isScrollEnd &&
    loadMoreButton &&
    !loadMoreButton.classList.contains('hidden')
  ) {
    try {
      page += 1;
      const { hits, totalHits } = await searchImages(searchTerm, page);
      console.log('Hits after fetching data:', hits);
      if (hits && hits.length > 0) {
        console.log('Hits before calling displayImages:', hits);
        displayImages(hits, totalHits);
      } else {
        notiflix.Notify.failure(
          'Nie znaleziono żadnych obrazów dla podanego hasła.'
        );
      }

      if (hits.length < 12) {
        loadMoreButton.classList.add('hidden');
        notiflix.Notify.info('Nie ma więcej wyników do wyświetlenia.');
      }
    } catch (error) {
      console.log(error);
      notiflix.Notify.failure('Wystąpił błąd podczas pobierania danych.');
    }
  }
});
