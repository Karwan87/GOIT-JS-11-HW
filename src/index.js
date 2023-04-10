import axios from 'axios';
import notiflix from 'notiflix';
import { searchImages } from './api.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

let page = 1;
let searchTerm = '';
const pageSize = 40;
const loadMoreButton = document.querySelector('.load-more');

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

const lightbox = new SimpleLightbox('.lightbox');

window.addEventListener('popstate', event => {
  if (event.state && event.state.gallery && event.state.total) {
    displayImages(event.state.gallery, event.state.total);
  }
});

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

    // back to last loaded results

    // link.addEventListener('click', event => {
    //   event.preventDefault();
    //   const imageUrl = event.target.getAttribute('data-src');
    //   const imageTitle = event.target.alt;
    //   lightbox.open({ src: imageUrl, title: imageTitle });

    //   const url = window.location.href.split('#')[0];
    //   const state = { gallery: images, total: totalHits };
    //   window.history.pushState(state, '', `${url}#lightbox`);
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
// info
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
          loadMoreButton.classList.add('visible');
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
