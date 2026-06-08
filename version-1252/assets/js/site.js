(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(text) {
    return String(text || "").toLowerCase().trim();
  }

  function getQueryValue(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function buildCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "" +
      "<article class=\"movie-card\">" +
      "<a href=\"" + escapeAttribute(movie.href) + "\" class=\"movie-link\" aria-label=\"观看" + escapeAttribute(movie.title) + "\">" +
      "<div class=\"poster\">" +
      "<img src=\"" + escapeAttribute(movie.cover) + "\" alt=\"" + escapeAttribute(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-region\">" + escapeHtml(movie.region) + "</span>" +
      "<span class=\"poster-year\">" + escapeHtml(movie.year) + "</span>" +
      "<span class=\"poster-play\">▶</span>" +
      "</div>" +
      "<div class=\"card-content\">" +
      "<h3>" + escapeHtml(movie.title) + "</h3>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "<div class=\"card-meta\"><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>" +
      "</div>" +
      "</a>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initSearchForms() {
    document.querySelectorAll(".js-search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || input.value.trim()) {
          return;
        }

        event.preventDefault();
        window.location.href = "search.html";
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }

    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function initFilterTabs() {
    var tabs = document.querySelector("[data-filter-tabs]");
    var grid = document.querySelector("[data-filter-grid]");
    if (!tabs || !grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    tabs.querySelectorAll("button").forEach(function (button) {
      button.addEventListener("click", function () {
        var value = button.getAttribute("data-filter-value");
        tabs.querySelectorAll("button").forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        cards.forEach(function (card) {
          var region = card.getAttribute("data-region") || "";
          card.style.display = value === "all" || region.indexOf(value) !== -1 ? "" : "none";
        });
      });
    });
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }

    var input = document.querySelector("[data-search-input]");
    var regionSelect = document.querySelector("[data-search-region]");
    var sortSelect = document.querySelector("[data-search-sort]");
    var title = document.querySelector("[data-search-title]");
    var pagination = document.querySelector("[data-search-pagination]");
    var pageSize = 48;
    var currentPage = 1;

    if (input) {
      input.value = getQueryValue("q");
      input.addEventListener("input", function () {
        currentPage = 1;
        render();
      });
    }

    if (regionSelect) {
      regionSelect.addEventListener("change", function () {
        currentPage = 1;
        render();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        currentPage = 1;
        render();
      });
    }

    function matchesRegion(movie, value) {
      return value === "all" || movie.region.indexOf(value) !== -1 || movie.tags.join(" ").indexOf(value) !== -1;
    }

    function render() {
      var query = normalize(input ? input.value : "");
      var region = regionSelect ? regionSelect.value : "all";
      var sort = sortSelect ? sortSelect.value : "match";
      var movies = window.SEARCH_MOVIES.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          (movie.tags || []).join(" ")
        ].join(" "));

        return (!query || haystack.indexOf(query) !== -1) && matchesRegion(movie, region);
      });

      if (sort === "year") {
        movies.sort(function (a, b) {
          return Number(b.year) - Number(a.year);
        });
      }

      if (sort === "title") {
        movies.sort(function (a, b) {
          return a.title.localeCompare(b.title, "zh-Hans-CN");
        });
      }

      var totalPages = Math.max(1, Math.ceil(movies.length / pageSize));
      currentPage = Math.min(currentPage, totalPages);
      var start = (currentPage - 1) * pageSize;
      var pageItems = movies.slice(start, start + pageSize);
      results.innerHTML = pageItems.map(buildCard).join("");

      if (title) {
        title.textContent = query ? "“" + input.value.trim() + "”相关内容" : "搜索结果";
      }

      renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
      if (!pagination) {
        return;
      }

      var pages = [];
      var begin = Math.max(1, currentPage - 3);
      var end = Math.min(totalPages, begin + 6);
      begin = Math.max(1, end - 6);

      for (var page = begin; page <= end; page += 1) {
        pages.push("<button type=\"button\" class=\"" + (page === currentPage ? "is-active" : "") + "\" data-page=\"" + page + "\">" + page + "</button>");
      }

      pagination.innerHTML = pages.join("");
      pagination.querySelectorAll("button").forEach(function (button) {
        button.addEventListener("click", function () {
          currentPage = Number(button.getAttribute("data-page"));
          render();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      });
    }

    render();
  }

  ready(function () {
    initMenu();
    initSearchForms();
    initHero();
    initFilterTabs();
    initSearchPage();
  });
})();
