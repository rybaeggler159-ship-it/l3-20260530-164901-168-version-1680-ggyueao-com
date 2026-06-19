(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const siteNav = document.querySelector('[data-site-nav]');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      siteNav.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  if (slides.length) {
    showSlide(0);
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  const filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    const keyword = filterPanel.querySelector('[data-filter-keyword]');
    const year = filterPanel.querySelector('[data-filter-year]');
    const region = filterPanel.querySelector('[data-filter-region]');
    const cards = Array.from(document.querySelectorAll('[data-title]'));

    function applyFilters() {
      const keywordValue = (keyword && keyword.value || '').trim().toLowerCase();
      const yearValue = year && year.value || '';
      const regionValue = region && region.value || '';

      cards.forEach(function (card) {
        const title = (card.dataset.title || '').toLowerCase();
        const genre = (card.dataset.genre || '').toLowerCase();
        const cardYear = card.dataset.year || '';
        const cardRegion = card.dataset.region || '';
        const matchKeyword = !keywordValue || title.includes(keywordValue) || genre.includes(keywordValue);
        const matchYear = !yearValue || cardYear === yearValue;
        const matchRegion = !regionValue || cardRegion.indexOf(regionValue) !== -1;
        card.style.display = matchKeyword && matchYear && matchRegion ? '' : 'none';
      });
    }

    [keyword, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  }
})();
