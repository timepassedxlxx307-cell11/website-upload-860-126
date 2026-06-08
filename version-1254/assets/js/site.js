import { H as Hls } from './hls-vendor-dru42stk.js';

const ready = (callback) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
};

const normalize = (value) => String(value || '').toLowerCase().trim();

const initMobileNav = () => {
  const button = document.querySelector('[data-mobile-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');
  if (!button || !panel) return;
  button.addEventListener('click', () => {
    panel.classList.toggle('is-open');
    button.textContent = panel.classList.contains('is-open') ? '×' : '☰';
  });
};

const initHero = () => {
  const root = document.querySelector('[data-hero]');
  if (!root) return;
  const slides = Array.from(root.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(root.querySelectorAll('[data-hero-dot]'));
  if (!slides.length) return;
  let current = 0;
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
  };
  dots.forEach((dot, index) => dot.addEventListener('click', () => show(index)));
  window.setInterval(() => show(current + 1), 5200);
};

const initSearchForms = () => {
  document.querySelectorAll('[data-search-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      const input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
      }
    });
  });
};

const initFilter = () => {
  const input = document.querySelector('[data-filter-input]');
  const area = document.querySelector('[data-filter-area]');
  if (!input || !area) return;
  const cards = Array.from(area.querySelectorAll('[data-card]'));
  input.addEventListener('input', () => {
    const query = normalize(input.value);
    cards.forEach((card) => {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.genre,
        card.dataset.year,
        card.dataset.type,
        card.dataset.region,
        card.textContent
      ].join(' '));
      card.classList.toggle('is-hidden', query && !haystack.includes(query));
    });
  });
};

const cardMarkup = (movie) => {
  const tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 3) : [];
  return `
<article class="movie-card" data-card data-title="${escapeHtml(movie.title)}" data-genre="${escapeHtml(movie.genre)}" data-year="${escapeHtml(movie.year)}" data-type="${escapeHtml(movie.type)}" data-region="${escapeHtml(movie.region)}">
  <a class="movie-poster poster-art" href="./${escapeHtml(movie.url)}" aria-label="${escapeHtml(movie.title)}">
    <img src="${escapeHtml(movie.image)}" alt="${escapeHtml(movie.title)}" class="poster-img" loading="lazy" onerror="this.style.display='none'">
    <span class="poster-letter">${escapeHtml(movie.title.slice(0, 2))}</span>
    <span class="poster-badge">${escapeHtml(movie.type)}</span>
  </a>
  <div class="movie-card-body">
    <div class="movie-card-meta">
      <span>${escapeHtml(movie.year)}</span>
      <span>${escapeHtml(movie.region)}</span>
    </div>
    <h3><a href="./${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h3>
    <p>${escapeHtml(movie.description)}</p>
    <div class="tag-row">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
    <div class="card-foot">
      <span>${escapeHtml(movie.genre)}</span>
      <strong>${escapeHtml(movie.rating)}</strong>
    </div>
  </div>
</article>`;
};

const escapeHtml = (value) => String(value || '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const initSearchPage = () => {
  const input = document.querySelector('[data-search-page-input]');
  const results = document.querySelector('[data-search-results]');
  const status = document.querySelector('[data-search-status]');
  const index = window.MovieSearchIndex || [];
  if (!input || !results || !status || !index.length) return;
  const params = new URLSearchParams(window.location.search);
  const initial = params.get('q') || '';
  if (initial) input.value = initial;
  const render = () => {
    const query = normalize(input.value);
    if (!query) {
      status.textContent = '输入关键词后将显示匹配影片。';
      results.innerHTML = index.slice(0, 48).map(cardMarkup).join('');
      return;
    }
    const terms = query.split(/\s+/).filter(Boolean);
    const matched = index.filter((movie) => {
      const haystack = normalize([
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.category,
        movie.description,
        Array.isArray(movie.tags) ? movie.tags.join(' ') : ''
      ].join(' '));
      return terms.every((term) => haystack.includes(term));
    }).slice(0, 120);
    status.textContent = matched.length ? `已匹配 ${matched.length} 部相关影片` : '没有匹配影片，请更换关键词。';
    results.innerHTML = matched.map(cardMarkup).join('');
  };
  input.addEventListener('input', render);
  render();
};

const initPlayers = () => {
  document.querySelectorAll('.movie-player').forEach((video) => {
    const source = video.dataset.m3u8;
    const wrap = video.closest('.player-wrap');
    const button = wrap ? wrap.querySelector('[data-play-button]') : null;
    let loaded = false;
    let hls = null;
    const load = () => {
      if (!source) return;
      if (!loaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
        loaded = true;
      }
      if (button) button.classList.add('is-hidden');
      video.play().catch(() => {});
    };
    if (button) button.addEventListener('click', load);
    video.addEventListener('click', () => {
      if (!loaded) load();
    });
    video.addEventListener('play', () => {
      if (button) button.classList.add('is-hidden');
    });
    window.addEventListener('pagehide', () => {
      if (hls) hls.destroy();
    });
  });
};

ready(() => {
  initMobileNav();
  initHero();
  initSearchForms();
  initFilter();
  initSearchPage();
  initPlayers();
});
