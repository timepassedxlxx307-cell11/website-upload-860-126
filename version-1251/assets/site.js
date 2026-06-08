(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (toggle && menu) {
            toggle.addEventListener("click", function() {
                menu.classList.toggle("is-open");
            });
        }

        var carousel = document.querySelector("[data-hero-carousel]");
        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;
            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function(slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function(dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }
            function start() {
                window.clearInterval(timer);
                timer = window.setInterval(function() {
                    show(current + 1);
                }, 5200);
            }
            dots.forEach(function(dot, index) {
                dot.addEventListener("click", function() {
                    show(index);
                    start();
                });
            });
            carousel.addEventListener("mouseenter", function() {
                window.clearInterval(timer);
            });
            carousel.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        var searchInput = document.querySelector("[data-search-input]");
        var regionFilter = document.querySelector("[data-filter-region]");
        var typeFilter = document.querySelector("[data-filter-type]");
        var yearFilter = document.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }
        function applyFilters() {
            var query = normalize(searchInput ? searchInput.value : "");
            var region = normalize(regionFilter ? regionFilter.value : "");
            var type = normalize(typeFilter ? typeFilter.value : "");
            var year = normalize(yearFilter ? yearFilter.value : "");
            cards.forEach(function(card) {
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchRegion = !region || normalize(card.getAttribute("data-region")) === region;
                var matchType = !type || normalize(card.getAttribute("data-type")) === type;
                var matchYear = !year || normalize(card.getAttribute("data-year")) === year;
                card.classList.toggle("is-filtered", !(matchQuery && matchRegion && matchType && matchYear));
            });
        }
        [searchInput, regionFilter, typeFilter, yearFilter].forEach(function(control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
    });
})();
