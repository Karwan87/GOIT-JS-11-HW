import { searchImages } from './api.js';

let currentPage = 1;
const perPage = 40;
let currentQuery = '';

const loadMoreButton = document.querySelector('.load-more');
const gallery = document.querySelector('.gallery');

loadMoreButton.addEventListener('click', () => {
  currentPage++;
  searchImages(currentQuery);
});

const updateUI = (images, totalHits) => {
  const imageElements = images.map(image => {
    return `
      <div class="gallery-item">
        <img src="${image.webformatURL}" alt="${image.tags}" class="gallery-image" />
        <div class="gallery-item-info">
          <ul>
            <li><strong>Views:</strong> ${image.views}</li>
            <li><strong>Downloads:</strong> ${image.downloads}</li>
            <li><strong>Likes:</strong> ${image.likes}</li>
          </ul>
        </div>
      </div>
    `;
  });
  gallery.insertAdjacentHTML('beforeend', imageElements.join(''));

  if (gallery.children.length >= totalHits) {
    loadMoreButton.style.display = 'none';
    const message = document.createElement('p');
    message.textContent =
      "We're sorry, but you've reached the end of search results.";
    gallery.insertAdjacentElement('beforeend', message);
  } else {
    loadMoreButton.style.display = 'block';
  }
};

const searchImages = async query => {
  if (query === '') {
    return;
  }
  if (query !== currentQuery) {
    currentPage = 1;
    currentQuery = query;
    gallery.innerHTML = '';
  }
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: currentPage,
        per_page: perPage,
      },
    });
    const images = response.data.hits;
    const totalHits = response.data.totalHits;
    updateUI(images, totalHits);
  } catch (error) {
    console.error(error);
  }
};

export default searchImages;
