import axios from 'axios';
import SimpleLightbox from 'SimpleLightbox';

const API_KEY = '35038868-0cefdd0904fdf8a70a3b6f6a2';
const PER_PAGE = 40;

export async function searchImages(searchTerm, page) {
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
    console.log(hits);

    const lightbox = new SimpleLightbox('gallery-item');
    return {
      hits,
      totalHits: data.totalHits,
    };
  } catch (error) {
    console.error(error);
    return {
      hits: [],
      totalHits: 0,
    };
  }
}
