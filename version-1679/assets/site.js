(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-mobile-nav]");

        if (!button || !menu) {
            return;
        }

        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHeaderSearch() {
        var forms = document.querySelectorAll(".site-search-form");

        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();

                var input = form.querySelector("input[name='q']");
                var target = form.getAttribute("data-search-target") || "search.html";
                var query = input ? input.value.trim() : "";
                var glue = target.indexOf("?") === -1 ? "?" : "&";

                window.location.href = query ? target + glue + "q=" + encodeURIComponent(query) : target;
            });
        });
    }

    function setupHeroCarousel() {
        var carousel = document.querySelector("[data-hero-carousel]");

        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function activate(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            if (timer || slides.length < 2) {
                return;
            }

            timer = window.setInterval(function () {
                activate(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                stop();
                activate(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        start();
    }

    function normalize(text) {
        return String(text || "").toLowerCase().trim();
    }

    function setupCardFilter() {
        var scope = document.querySelector("[data-card-filter]");
        var list = document.querySelector("[data-filter-list]");

        if (!scope || !list) {
            return;
        }

        var input = scope.querySelector("[data-filter-input]");
        var year = scope.querySelector("[data-year-filter]");
        var region = scope.querySelector("[data-region-filter]");
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

        function apply() {
            var keyword = normalize(input && input.value);
            var selectedYear = year ? year.value : "";
            var selectedRegion = region ? region.value : "";

            cards.forEach(function (card) {
                var matchKeyword = !keyword || normalize(card.getAttribute("data-search")).indexOf(keyword) !== -1;
                var matchYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
                var matchRegion = !selectedRegion || card.getAttribute("data-region") === selectedRegion;

                card.style.display = matchKeyword && matchYear && matchRegion ? "" : "none";
            });
        }

        [input, year, region].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    }

    function getQueryParam(name) {
        return new URLSearchParams(window.location.search).get(name) || "";
    }

    function setupSearchPage() {
        var root = document.querySelector("[data-search-page]");

        if (!root || !window.MOVIE_INDEX) {
            return;
        }

        var input = document.getElementById("searchPageInput");
        var category = document.getElementById("searchCategory");
        var year = document.getElementById("searchYear");
        var count = document.getElementById("searchCount");
        var results = document.getElementById("searchResults");
        var movies = window.MOVIE_INDEX || [];

        var years = Array.from(new Set(movies.map(function (movie) {
            return movie.year;
        }))).sort().reverse();

        years.forEach(function (value) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            year.appendChild(option);
        });

        input.value = getQueryParam("q");

        function card(movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return "#" + tag;
            }).join(" ");

            return [
                "<article class=\"movie-card\">",
                "<a class=\"movie-card-cover\" href=\"" + escapeHtml(movie.url) + "\">",
                "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
                "<span class=\"movie-card-mask\"></span>",
                "<span class=\"play-badge\" aria-hidden=\"true\">▶</span>",
                "<span class=\"duration-badge\">" + escapeHtml(movie.duration) + "</span>",
                "</a>",
                "<div class=\"movie-card-body\">",
                "<span class=\"category-pill\">" + escapeHtml(movie.category) + "</span>",
                "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
                "<p>" + escapeHtml(movie.oneLine || tags) + "</p>",
                "<div class=\"movie-meta-row\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(tags) + "</span></div>",
                "</div>",
                "</article>"
            ].join("");
        }

        function apply() {
            var keyword = normalize(input.value);
            var selectedCategory = category.value;
            var selectedYear = year.value;

            var matched = movies.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.category,
                    movie.year,
                    movie.region,
                    movie.genre,
                    (movie.tags || []).join(" "),
                    movie.oneLine
                ].join(" "));

                return (!keyword || haystack.indexOf(keyword) !== -1) &&
                    (!selectedCategory || movie.category === selectedCategory) &&
                    (!selectedYear || movie.year === selectedYear);
            }).slice(0, 240);

            count.textContent = "找到 " + matched.length + " 条结果" + (matched.length === 240 ? "，可继续缩小关键词" : "");
            results.innerHTML = matched.map(card).join("");
        }

        [input, category, year].forEach(function (control) {
            control.addEventListener("input", apply);
            control.addEventListener("change", apply);
        });

        apply();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    ready(function () {
        setupMobileMenu();
        setupHeaderSearch();
        setupHeroCarousel();
        setupCardFilter();
        setupSearchPage();
    });
}());
