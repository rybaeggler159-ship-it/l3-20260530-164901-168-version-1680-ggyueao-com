(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var links = document.querySelector('[data-nav-links]');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
  }

  var next = document.querySelector('[data-hero-next]');
  var prev = document.querySelector('[data-hero-prev]');

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
    });
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
    });
  }

  if (slides.length) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var localSearch = document.querySelector('[data-local-search]');
  var localType = document.querySelector('[data-local-type]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var empty = document.querySelector('[data-empty]');

  function applyLocalFilter() {
    if (!cards.length) {
      return;
    }

    var q = localSearch ? localSearch.value.trim().toLowerCase() : '';
    var t = localType ? localType.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var type = card.getAttribute('data-type') || '';
      var ok = (!q || text.indexOf(q) !== -1) && (!t || type === t);
      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });

    if (empty) {
      empty.style.display = visible ? 'none' : 'block';
    }
  }

  if (localSearch) {
    localSearch.addEventListener('input', applyLocalFilter);
  }

  if (localType) {
    localType.addEventListener('change', applyLocalFilter);
  }

  var globalSearch = document.querySelector('[data-global-search]');
  var globalResults = document.querySelector('[data-global-results]');

  function renderGlobalSearch() {
    if (!globalSearch || !globalResults || !window.SEARCH_MOVIES) {
      return;
    }

    var q = globalSearch.value.trim().toLowerCase();
    var list = window.SEARCH_MOVIES;

    if (q) {
      list = list.filter(function (item) {
        return item.search.indexOf(q) !== -1;
      });
    }

    list = list.slice(0, 80);

    globalResults.innerHTML = list.map(function (item) {
      return [
        '<a class="rank-item" href="' + item.url + '">',
        '<span class="rank-num">' + item.id + '</span>',
        '<span class="rank-thumb"><img src="' + item.cover + '" alt="' + item.title + '"></span>',
        '<span>',
        '<strong class="rank-title">' + item.title + '</strong>',
        '<p>' + item.meta + '</p>',
        '</span>',
        '<span class="btn btn-primary">进入详情</span>',
        '</a>'
      ].join('');
    }).join('');
  }

  if (globalSearch) {
    globalSearch.addEventListener('input', renderGlobalSearch);
    renderGlobalSearch();
  }
})();
