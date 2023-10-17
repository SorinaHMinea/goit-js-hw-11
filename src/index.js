import axios from 'axios';
import notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import InfiniteScroll from 'infinite-scroll';

const apiKey = '40060920-6840b24aaee2d2997514145f9';
const perPage = 40;
let page = 1;
let currentSearchQuery = '';
let totalHits = 0;

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');

const initializeSimpleLightbox = () => {
  const lightbox = new SimpleLightbox('.gallery a');
  lightbox.refresh();
};

const performImageSearch = async (query, pageNumber) => {
  const apiUrl = `https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${pageNumber}&per_page=${perPage}`;
  try {
    const response = await axios.get(apiUrl);
    const data = response.data;
    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      showNotification(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return [];
    }

    return data.hits;
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
};

const createImageCard = image => {
  const card = document.createElement('div');
  card.classList.add('photo-card');

  const a = document.createElement('a');
  a.href = image.largeImageURL;
  a.setAttribute('data-lightbox', 'gallery');
  a.setAttribute('data-title', image.tags);

  const img = document.createElement('img');
  img.src = image.webformatURL;
  img.alt = image.tags;
  img.loading = 'lazy';

  const info = document.createElement('div');
  info.classList.add('info');

  const likes = createInfoItem('Likes', image.likes);
  const views = createInfoItem('Views', image.views);
  const comments = createInfoItem('Comments', image.comments);
  const downloads = createInfoItem('Downloads', image.downloads);

  info.appendChild(likes);
  info.appendChild(views);
  info.appendChild(comments);
  info.appendChild(downloads);

  a.appendChild(img);
  card.appendChild(a);
  card.appendChild(info);

  return card;
};

const createInfoItem = (label, value) => {
  const infoItem = document.createElement('p');
  infoItem.classList.add('info-item');
  infoItem.innerHTML = `<b>${label}</b>: ${value}`;
  return infoItem;
};

const showNotification = message => {
  notiflix.Notify.success(message);
};

const loadImages = async () => {
  const images = await performImageSearch(currentSearchQuery, page);
  if (images.length > 0) {
    images.forEach(image => {
      const card = createImageCard(image);
      gallery.appendChild(card);
    });

    initializeSimpleLightbox();

    if (gallery.childElementCount >= totalHits) {
      hideLoadMoreButton();
    }
  }
};

searchForm.addEventListener('submit', async e => {
  e.preventDefault();
  page = 1;
  currentSearchQuery = e.target.searchQuery.value.trim();
  gallery.innerHTML = '';
  await loadImages();
  showNotification(`Hooray! We found ${totalHits} images.`);
});

const infiniteScroll = new InfiniteScroll(gallery, {
  responseType: 'text',
  history: false,
  path: () => {
    return `https://pixabay.com/api/?key=${apiKey}&q=${currentSearchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${
      page + 1
    }&per_page=${perPage}`;
  },
});

infiniteScroll.on('load', () => {
  page++;
  loadImages();
});

const hideLoadMoreButton = () => {
  const loadMoreButton = document.querySelector('.load-more');
  loadMoreButton.style.display = 'none';
};

hideLoadMoreButton();
