(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var opened = mobilePanel.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
      menuButton.textContent = opened ? '×' : '☰';
    });
  }

  var hero = document.querySelector('[data-hero-slider]');

  if (hero) {
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('.hero-dot', hero);
    var index = 0;
    var timer = null;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function autoPlay() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    selectAll('.hero-prev', hero).forEach(function (button) {
      button.addEventListener('click', function () {
        showSlide(index - 1);
        autoPlay();
      });
    });

    selectAll('.hero-next', hero).forEach(function (button) {
      button.addEventListener('click', function () {
        showSlide(index + 1);
        autoPlay();
      });
    });

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
        autoPlay();
      });
    });

    showSlide(0);
    autoPlay();
  }

  selectAll('[data-listing]').forEach(function (listing) {
    var input = listing.querySelector('.movie-search-input');
    var chips = selectAll('.filter-chip', listing);
    var cards = selectAll('.movie-card, .ranking-row', listing);
    var empty = listing.querySelector('.empty-state');
    var activeFilter = 'all';

    if (listing.getAttribute('data-url-query') === 'true' && input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
      }
    }

    function valueOf(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' ').toLowerCase();
    }

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = valueOf(card);
        var keywordOk = !keyword || text.indexOf(keyword) !== -1;
        var filterOk = activeFilter === 'all' || text.indexOf(activeFilter.toLowerCase()) !== -1;
        var show = keywordOk && filterOk;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        activeFilter = chip.getAttribute('data-filter') || 'all';
        applyFilter();
      });
    });

    applyFilter();
  });

  selectAll('.watch-player').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-layer');
    var stream = player.getAttribute('data-stream');
    var hls = null;
    var ready = false;

    function loadVideo() {
      if (!video || !stream || ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function playVideo() {
      loadVideo();
      player.classList.add('playing');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          player.classList.remove('playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    player.addEventListener('click', function (event) {
      if (event.target === player) {
        playVideo();
      }
    });

    if (video) {
      video.addEventListener('play', function () {
        player.classList.add('playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          player.classList.remove('playing');
        }
      });
      video.addEventListener('ended', function () {
        player.classList.remove('playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
