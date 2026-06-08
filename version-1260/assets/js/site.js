(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
            var current = 0;
            var show = function (index) {
                current = index;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === index);
                });
            };
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                });
            });
            if (slides.length > 1) {
                window.setInterval(function () {
                    show((current + 1) % slides.length);
                }, 5200);
            }
        }

        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var scope = panel.closest("main") || document;
            var input = panel.querySelector("[data-filter-input]");
            var region = panel.querySelector("[data-filter-region]");
            var year = panel.querySelector("[data-filter-year]");
            var genre = panel.querySelector("[data-filter-genre]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var empty = scope.querySelector("[data-search-empty]");
            var filter = function () {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var regionValue = region ? region.value : "";
                var yearValue = year ? year.value : "";
                var genreValue = genre ? genre.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var ok = true;
                    if (keyword && card.dataset.search.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (regionValue && card.dataset.region !== regionValue) {
                        ok = false;
                    }
                    if (yearValue && card.dataset.year !== yearValue) {
                        ok = false;
                    }
                    if (genreValue && card.dataset.genre.indexOf(genreValue) === -1) {
                        ok = false;
                    }
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            };
            [input, region, year, genre].forEach(function (item) {
                if (item) {
                    item.addEventListener("input", filter);
                    item.addEventListener("change", filter);
                }
            });
        });
    });
})();
