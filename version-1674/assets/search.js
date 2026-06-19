(function () {
  const form = document.querySelector('[data-search-form]');
  const results = document.querySelector('[data-search-results]');
  const empty = document.querySelector('[data-search-empty]');

  if (!form || !results || !window.SEARCH_INDEX) {
    return;
  }

  const keywordInput = form.querySelector('[data-search-keyword]');
  const typeSelect = form.querySelector('[data-search-type]');
  const regionSelect = form.querySelector('[data-search-region]');

  function render(items) {
    results.innerHTML = items.slice(0, 160).map(function (item) {
      const tags = item.tags.slice(0, 3).map(function (tag) {
        return '<span>' + tag + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '  <a class="movie-card__poster" href="./detail/' + item.code + '.html" aria-label="' + item.title + '">',
        '    <img src="./' + item.cover + '.jpg" alt="' + item.title + '" loading="lazy" onerror="this.classList.add(\'is-missing-image\')">',
        '    <span class="movie-card__score">' + item.score + '</span>',
        '    <span class="movie-card__year">' + item.year + '</span>',
        '  </a>',
        '  <div class="movie-card__body">',
        '    <a class="movie-card__title" href="./detail/' + item.code + '.html">' + item.title + '</a>',
        '    <p class="movie-card__desc">' + item.one_line + '</p>',
        '    <div class="movie-card__meta"><span>' + item.region + '</span><span>' + item.type + '</span></div>',
        '    <div class="movie-card__tags">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');

    if (empty) {
      empty.hidden = items.length !== 0;
    }
  }

  function applySearch() {
    const keyword = (keywordInput.value || '').trim().toLowerCase();
    const type = typeSelect.value || '';
    const region = regionSelect.value || '';

    const items = window.SEARCH_INDEX.filter(function (item) {
      const text = (item.title + ' ' + item.genre + ' ' + item.tags.join(' ') + ' ' + item.one_line).toLowerCase();
      const matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      const matchType = !type || item.type.indexOf(type) !== -1;
      const matchRegion = !region || item.region.indexOf(region) !== -1;
      return matchKeyword && matchType && matchRegion;
    });

    render(items);
  }

  form.addEventListener('input', applySearch);
  form.addEventListener('change', applySearch);
  render(window.SEARCH_INDEX.slice(0, 60));
})();
