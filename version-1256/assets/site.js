(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var navToggle = document.getElementById("navToggle");
    var navLinks = document.getElementById("navLinks");

    if (navToggle && navLinks) {
      navToggle.addEventListener("click", function () {
        navLinks.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var previous = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    if (slides.length) {
      showSlide(0);
      if (previous) {
        previous.addEventListener("click", function () {
          showSlide(active - 1);
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          showSlide(active + 1);
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
        });
      });
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5600);
    }

    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));

    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = String(card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          card.classList.toggle("is-hidden", keyword !== "" && text.indexOf(keyword) === -1);
        });
      });
    });

    Array.prototype.slice.call(document.querySelectorAll("[data-scroll-target]")).forEach(function (button) {
      button.addEventListener("click", function () {
        var selector = button.getAttribute("data-scroll-target");
        var track = selector ? document.querySelector(selector) : null;
        var direction = button.getAttribute("data-scroll-direction") === "prev" ? -1 : 1;
        if (track) {
          track.scrollBy({ left: direction * 320, behavior: "smooth" });
        }
      });
    });
  });
})();

function createMoviePlayer(source) {
  var video = document.getElementById("movie-player");
  var overlay = document.getElementById("player-overlay");
  var button = document.getElementById("player-button");
  var hlsInstance = null;

  if (!video || !source) {
    return;
  }

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
  } else if (window.Hls && window.Hls.isSupported()) {
    hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
    hlsInstance.loadSource(source);
    hlsInstance.attachMedia(video);
  } else {
    video.src = source;
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  }

  function startPlayback() {
    hideOverlay();
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      startPlayback();
    });
  }

  if (overlay) {
    overlay.addEventListener("click", function () {
      startPlayback();
    });
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    } else {
      video.pause();
    }
  });

  video.addEventListener("play", hideOverlay);
  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
