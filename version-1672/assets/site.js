(function () {
  "use strict";

  function getRootPrefix() {
    var path = window.location.pathname;
    return path.indexOf("/movies/") !== -1 ? "../" : "./";
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var drawer = document.querySelector("[data-mobile-drawer]");

    if (!toggle || !drawer) {
      return;
    }

    toggle.addEventListener("click", function () {
      drawer.classList.toggle("is-open");
    });
  }

  function initSiteSearch() {
    var input = document.querySelector("[data-site-search]");
    var panel = document.querySelector("[data-search-results]");

    if (!input || !panel || !Array.isArray(window.SEARCH_MOVIES)) {
      return;
    }

    var root = getRootPrefix();

    function renderResults(query) {
      var keyword = normalize(query);

      if (!keyword) {
        panel.classList.remove("is-open");
        panel.innerHTML = "";
        return;
      }

      var matches = window.SEARCH_MOVIES.filter(function (item) {
        var haystack = normalize([
          item.title,
          item.region,
          item.type,
          item.year,
          item.category,
          item.tags,
          item.description
        ].join(" "));
        return haystack.indexOf(keyword) !== -1;
      }).slice(0, 9);

      panel.classList.add("is-open");

      if (!matches.length) {
        panel.innerHTML = '<div class="search-empty">没有找到匹配内容</div>';
        return;
      }

      panel.innerHTML = matches.map(function (item) {
        return [
          '<a class="search-item" href="' + root + item.url + '">',
          '  <img src="' + root + item.cover + '" alt="' + escapeHtml(item.title) + '">',
          '  <span>',
          '    <strong>' + escapeHtml(item.title) + '</strong>',
          '    <span>' + escapeHtml(item.year + " · " + item.region + " · " + item.type) + '</span>',
          '  </span>',
          '</a>'
        ].join("");
      }).join("");
    }

    input.addEventListener("input", function () {
      renderResults(input.value);
    });

    input.addEventListener("focus", function () {
      renderResults(input.value);
    });

    document.addEventListener("click", function (event) {
      if (!panel.contains(event.target) && event.target !== input) {
        panel.classList.remove("is-open");
      }
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initHeroSlider() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));

    if (slides.length <= 1) {
      return;
    }

    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }

        showSlide(index);
        start();
      });
    });

    showSlide(0);
    start();
  }

  function initLocalFilters() {
    var list = document.querySelector("[data-card-list]");
    var input = document.querySelector("[data-local-search]");
    var typeSelect = document.querySelector("[data-type-filter]");
    var yearSelect = document.querySelector("[data-year-filter]");
    var empty = document.querySelector("[data-empty-state]");

    if (!list || !input) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

    function applyFilter() {
      var keyword = normalize(input.value);
      var typeValue = typeSelect ? normalize(typeSelect.value) : "";
      var yearValue = yearSelect ? normalize(yearSelect.value) : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" "));
        var typeMatch = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
        var yearMatch = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
        var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
        var shouldShow = typeMatch && yearMatch && keywordMatch;

        card.style.display = shouldShow ? "" : "none";

        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    input.addEventListener("input", applyFilter);

    if (typeSelect) {
      typeSelect.addEventListener("change", applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilter);
    }
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-play]");
      var source = video ? video.getAttribute("data-src") : "";

      if (!video || !source) {
        return;
      }

      function attachSource() {
        if (video.getAttribute("data-ready") === "true") {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          video.hlsInstance = hls;
        } else {
          video.src = source;
        }

        video.setAttribute("data-ready", "true");
        shell.classList.add("is-ready");
      }

      function startPlayback(event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }

        attachSource();

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            video.setAttribute("controls", "controls");
          });
        }
      }

      shell.addEventListener("click", function (event) {
        if (event.target === video) {
          attachSource();
          return;
        }

        startPlayback(event);
      });

      if (button) {
        button.addEventListener("click", startPlayback);
      }

      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        shell.classList.remove("is-playing");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initSiteSearch();
    initHeroSlider();
    initLocalFilters();
    initPlayers();
  });
})();
