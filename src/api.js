import axios from 'axios';

const API_KEY = '35038868-0cefdd0904fdf8a70a3b6f6a2';

const searchImages = async query => {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
      },
    });
    return response.data.hits;
  } catch (error) {
    console.error(error);
    return [];
  }
};
export async function searchImages(searchTerm) {
  const response = await axios.get(
    `https://pixabay.com/api/?key=35038868-0cefdd0904fdf8a70a3b6f6a2&q=${searchTerm}&image_type=photo`
  );
  const images = response.data.hits;
  return images;
}
