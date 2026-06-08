(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initMobileNav() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }

        button.addEventListener("click", function () {
            var isOpen = nav.classList.toggle("is-open");
            button.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (slides.length <= 1) {
            return;
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function initLocalFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var list = document.querySelector("[data-filter-list]");
            if (!list) {
                return;
            }

            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
            var input = panel.querySelector("[data-filter-input]");
            var regionSelect = panel.querySelector("[data-filter-region]");
            var typeSelect = panel.querySelector("[data-filter-type]");
            var yearSelect = panel.querySelector("[data-filter-year]");
            var count = panel.querySelector("[data-filter-count]");
            var empty = document.querySelector("[data-filter-empty]");

            function apply() {
                var query = normalize(input && input.value);
                var region = normalize(regionSelect && regionSelect.value);
                var type = normalize(typeSelect && typeSelect.value);
                var year = normalize(yearSelect && yearSelect.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags")
                    ].join(" "));

                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesRegion = !region || normalize(card.getAttribute("data-region")).indexOf(region) !== -1;
                    var matchesType = !type || normalize(card.getAttribute("data-type")).indexOf(type) !== -1;
                    var matchesYear = !year || normalize(card.getAttribute("data-year")) === year;
                    var shouldShow = matchesQuery && matchesRegion && matchesType && matchesYear;

                    card.classList.toggle("is-hidden", !shouldShow);
                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = String(visible);
                }
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [input, regionSelect, typeSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            apply();
        });
    }

    function createMovieCard(movie) {
        var tags = Array.isArray(movie.tags) ? movie.tags.join(",") : "";
        return [
            '<article class="movie-card movie-card-small" data-movie-card data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-region="' + escapeHtml(movie.region) + '" data-type="' + escapeHtml(movie.type) + '" data-genre="' + escapeHtml(movie.genre) + '" data-tags="' + escapeHtml(tags) + '">',
            '    <a class="movie-card-link" href="' + escapeHtml(movie.detailUrl) + '">',
            '        <div class="movie-poster-wrap">',
            '            <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '            <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
            '            <div class="poster-hover">',
            '                <p>' + escapeHtml(movie.oneLine) + '</p>',
            '                <span>' + escapeHtml(movie.genreFirst) + '</span>',
            '            </div>',
            '        </div>',
            '        <div class="movie-card-body">',
            '            <h3>' + escapeHtml(movie.title) + '</h3>',
            '            <div class="movie-meta-line">',
            '                <span>' + escapeHtml(movie.region) + '</span>',
            '                <span>' + escapeHtml(movie.genreFirst) + '</span>',
            '            </div>',
            '        </div>',
            '    </a>',
            '</article>'
        ].join("\n");
    }

    function initGlobalSearch() {
        var panel = document.querySelector("[data-search-panel]");
        var results = document.querySelector("[data-global-results]");
        if (!panel || !results || !window.MOVIES) {
            return;
        }

        var input = panel.querySelector("[data-global-search-input]");
        var regionSelect = panel.querySelector("[data-global-region]");
        var typeSelect = panel.querySelector("[data-global-type]");
        var count = panel.querySelector("[data-global-count]");
        var empty = document.querySelector("[data-global-empty]");

        function apply() {
            var query = normalize(input && input.value);
            var region = normalize(regionSelect && regionSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var matches = window.MOVIES.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.genreFirst,
                    Array.isArray(movie.tags) ? movie.tags.join(" ") : ""
                ].join(" "));
                var matchesQuery = !query || haystack.indexOf(query) !== -1;
                var matchesRegion = !region || normalize(movie.region).indexOf(region) !== -1;
                var matchesType = !type || normalize(movie.type).indexOf(type) !== -1;
                return matchesQuery && matchesRegion && matchesType;
            }).slice(0, 240);

            results.innerHTML = matches.map(createMovieCard).join("\n");

            if (count) {
                count.textContent = String(matches.length);
            }
            if (empty) {
                empty.hidden = matches.length !== 0;
            }
        }

        [input, regionSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    }

    ready(function () {
        initMobileNav();
        initHero();
        initLocalFilters();
        initGlobalSearch();
    });
}());
