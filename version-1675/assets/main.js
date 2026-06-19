function qs(selector, scope) {
  return (scope || document).querySelector(selector);
}

function qsa(selector, scope) {
  return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
}

function setHeroSlide(index) {
  var slides = qsa('[data-hero-slide]');
  var thumbs = qsa('[data-hero-thumb]');
  var dots = qsa('[data-hero-dot]');
  if (!slides.length) {
    return;
  }
  var next = (index + slides.length) % slides.length;
  slides.forEach(function (slide, i) {
    slide.classList.toggle('is-active', i === next);
  });
  thumbs.forEach(function (thumb, i) {
    thumb.classList.toggle('is-active', i === next);
  });
  dots.forEach(function (dot, i) {
    dot.classList.toggle('is-active', i === next);
  });
  document.documentElement.dataset.heroIndex = String(next);
}

function setupHero() {
  var slides = qsa('[data-hero-slide]');
  if (!slides.length) {
    return;
  }
  var current = 0;
  setHeroSlide(0);
  qsa('[data-hero-thumb], [data-hero-dot]').forEach(function (control) {
    control.addEventListener('click', function () {
      current = Number(control.getAttribute('data-index') || '0');
      setHeroSlide(current);
    });
  });
  window.setInterval(function () {
    current = (current + 1) % slides.length;
    setHeroSlide(current);
  }, 5200);
}

function setupMobileMenu() {
  var toggle = qs('[data-mobile-toggle]');
  var menu = qs('[data-mobile-menu]');
  if (!toggle || !menu) {
    return;
  }
  toggle.addEventListener('click', function () {
    menu.classList.toggle('is-open');
  });
}

function renderSearchResults(input, panel) {
  var term = input.value.trim().toLowerCase();
  if (!term || typeof SEARCH_INDEX === 'undefined') {
    panel.classList.remove('is-open');
    panel.innerHTML = '';
    return;
  }
  var results = SEARCH_INDEX.filter(function (item) {
    return [item.title, item.year, item.region, item.type, item.genre, item.category, item.desc].join(' ').toLowerCase().indexOf(term) !== -1;
  }).slice(0, 9);
  if (!results.length) {
    panel.classList.add('is-open');
    panel.innerHTML = '<div class="search-result-item"><div></div><div><strong>未找到匹配影片</strong><span>换一个关键词继续搜索</span></div></div>';
    return;
  }
  panel.classList.add('is-open');
  panel.innerHTML = results.map(function (item) {
    return '<a class="search-result-item" href="' + item.url + '"><img src="' + item.image + '" alt="' + item.title.replace(/"/g, '&quot;') + '"><div><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.genre + '</span></div></a>';
  }).join('');
}

function setupSearch() {
  qsa('[data-search-box]').forEach(function (box) {
    var input = qs('[data-search-input]', box);
    var panel = qs('[data-search-results]', box);
    if (!input || !panel) {
      return;
    }
    input.addEventListener('input', function () {
      renderSearchResults(input, panel);
    });
    input.addEventListener('focus', function () {
      renderSearchResults(input, panel);
    });
    document.addEventListener('click', function (event) {
      if (!box.contains(event.target)) {
        panel.classList.remove('is-open');
      }
    });
  });
}

function setupCategoryFilter() {
  var input = qs('[data-card-filter]');
  var empty = qs('[data-empty-state]');
  if (!input) {
    return;
  }
  input.addEventListener('input', function () {
    var term = input.value.trim().toLowerCase();
    var visible = 0;
    qsa('[data-card-text]').forEach(function (card) {
      var matched = card.getAttribute('data-card-text').toLowerCase().indexOf(term) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.style.display = visible ? 'none' : 'block';
    }
  });
}

function bindStreamPlayer(videoId, overlayId, streamUrl) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  if (!video || !overlay || !streamUrl) {
    return;
  }
  var started = false;
  function start() {
    if (!started) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      started = true;
    }
    overlay.classList.add('is-hidden');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }
  overlay.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (!started || video.paused) {
      start();
    }
  });
}

window.bindStreamPlayer = bindStreamPlayer;

document.addEventListener('DOMContentLoaded', function () {
  setupMobileMenu();
  setupHero();
  setupSearch();
  setupCategoryFilter();
});
