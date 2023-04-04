import axios from 'axios';
import notiflix from 'notiflix';
import { searchImages } from './api.js';
const displayNoResultsNotification = () => {
  notiflix.Notify.warning(
    'Sorry, there are no images matching your search query. Please try again.'
  );
};

const form = document.querySelector('form');
const input = form.querySelector('input');
const resultsDiv = document.getElementById('results');

form.addEventListener('submit', async e => {
  e.preventDefault();
  const searchTerm = input.value.trim();
  if (searchTerm !== '') {
    try {
      const images = await searchImages(searchTerm);
      if (images.length > 0) {
        displayImages(images);
      } else {
        notiflix.Notify.failure(
          'Nie znaleziono żadnych obrazów dla podanego hasła.'
        );
      }
    } catch (error) {
      notiflix.Notify.failure('Wystąpił błąd podczas pobierania danych.');
    }
  }
});

function displayImages(images) {
  const galleryDiv = document.querySelector('.gallery');
  galleryDiv.innerHTML = '';

  if (images.length === 0) {
    displayNoResultsNotification();
    return;
  }

  images.forEach(image => {
    const card = document.createElement('div');
    card.classList.add('photo-card');

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

    card.appendChild(infoDiv);
    galleryDiv.appendChild(card);
  });
}
