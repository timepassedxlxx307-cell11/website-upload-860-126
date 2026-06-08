(function() {
  var mobileButton = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function() {
      mobileNav.classList.toggle('open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === current);
      });
      dots.forEach(function(dot, itemIndex) {
        dot.classList.toggle('active', itemIndex === current);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function() {
      showSlide(current + 1);
    }, 5600);
  }

  var searchInput = document.querySelector('[data-search-input]');
  var clearSearch = document.querySelector('[data-clear-search]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var emptyState = document.querySelector('[data-empty-state]');
  var activeFilter = '';

  function matchTokens(text, filterText) {
    if (!filterText) {
      return true;
    }
    return filterText.split(/\s+/).filter(Boolean).some(function(token) {
      return text.indexOf(token.toLowerCase()) !== -1;
    });
  }

  function applyFilter() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var visible = 0;

    cards.forEach(function(card) {
      var text = (card.getAttribute('data-combined') || card.textContent || '').toLowerCase();
      var title = (card.getAttribute('data-title') || '').toLowerCase();
      var bySearch = !query || text.indexOf(query) !== -1 || title.indexOf(query) !== -1;
      var byFilter = matchTokens(text, activeFilter);
      var shouldShow = bySearch && byFilter;
      card.style.display = shouldShow ? '' : 'none';
      if (shouldShow) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', visible === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilter);
  }

  if (clearSearch) {
    clearSearch.addEventListener('click', function() {
      if (searchInput) {
        searchInput.value = '';
      }
      activeFilter = '';
      document.querySelectorAll('[data-filter]').forEach(function(button) {
        button.classList.toggle('active', button.getAttribute('data-filter') === '');
      });
      applyFilter();
    });
  }

  document.querySelectorAll('[data-filter]').forEach(function(button) {
    button.addEventListener('click', function() {
      activeFilter = button.getAttribute('data-filter') || '';
      document.querySelectorAll('[data-filter]').forEach(function(item) {
        item.classList.remove('active');
      });
      button.classList.add('active');
      applyFilter();
    });
  });

  document.querySelectorAll('[data-player]').forEach(function(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.watch-overlay');
    var hasLoaded = false;

    function startVideo() {
      if (!video) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      if (!stream) {
        return;
      }
      if (!hasLoaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        hasLoaded = true;
      }
      if (overlay) {
        overlay.classList.add('hidden');
      }
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function() {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startVideo);
    }

    if (video) {
      video.addEventListener('click', function() {
        if (!hasLoaded) {
          startVideo();
        }
      });
    }
  });
})();
