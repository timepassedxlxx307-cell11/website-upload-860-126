(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (toggle && menu) {
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var activeIndex = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === activeIndex);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === activeIndex);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    var keyword = document.querySelector("[data-filter-keyword]");
    var region = document.querySelector("[data-filter-region]");
    var type = document.querySelector("[data-filter-type]");
    var year = document.querySelector("[data-filter-year]");
    var count = document.querySelector("[data-result-count]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

    function paramsQuery() {
        try {
            var params = new URLSearchParams(window.location.search);
            return params.get("q") || "";
        } catch (error) {
            return "";
        }
    }

    if (keyword && !keyword.value) {
        keyword.value = paramsQuery();
    }

    function includesValue(source, value) {
        return !value || String(source || "").toLowerCase().indexOf(String(value).toLowerCase()) !== -1;
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }

        var q = keyword ? keyword.value.trim() : "";
        var r = region ? region.value : "";
        var t = type ? type.value : "";
        var y = year ? year.value : "";
        var visible = 0;

        cards.forEach(function (card) {
            var matched = includesValue(card.getAttribute("data-text"), q) &&
                includesValue(card.getAttribute("data-region"), r) &&
                includesValue(card.getAttribute("data-type"), t) &&
                includesValue(card.getAttribute("data-year"), y);

            card.classList.toggle("is-hidden-card", !matched);
            if (matched) {
                visible += 1;
            }
        });

        if (count) {
            count.textContent = "当前显示 " + visible + " 部影片";
        }
    }

    [keyword, region, type, year].forEach(function (control) {
        if (control) {
            control.addEventListener("input", filterCards);
            control.addEventListener("change", filterCards);
        }
    });

    filterCards();
})();
