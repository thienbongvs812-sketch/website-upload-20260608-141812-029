(function () {
  function getAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initForms() {
    getAll('[data-site-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        if (!query) {
          return;
        }
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(query);
      });
    });
  }

  function initHero() {
    var slides = getAll('[data-hero-slide]');
    if (!slides.length) {
      return;
    }
    var dots = getAll('[data-hero-dot]');
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        restart();
      });
    });

    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    start();
  }

  function initFiltering() {
    var input = document.querySelector('[data-page-filter]');
    var year = document.querySelector('[data-year-filter]');
    var reset = document.querySelector('[data-filter-reset]');
    var cards = getAll('[data-movie-card]');
    var empty = document.querySelector('[data-search-empty]');
    if (!cards.length || !input) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      input.value = query;
    }

    function apply() {
      var text = input.value.trim().toLowerCase();
      var selectedYear = year ? year.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        var okText = !text || haystack.indexOf(text) !== -1;
        var okYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
        var show = okText && okYear;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    input.addEventListener('input', apply);
    if (year) {
      year.addEventListener('change', apply);
    }
    if (reset) {
      reset.addEventListener('click', function () {
        input.value = '';
        if (year) {
          year.value = '';
        }
        apply();
      });
    }
    apply();
  }

  function initPlayer() {
    var shell = document.querySelector('[data-player]');
    var video = document.querySelector('[data-video]');
    var button = document.querySelector('[data-play-button]');
    if (!shell || !video || !button) {
      return;
    }
    var src = shell.getAttribute('data-vod');
    var loaded = false;
    var hls = null;

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function play() {
      shell.classList.add('is-playing');
      load();
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        play();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initForms();
    initHero();
    initFiltering();
    initPlayer();
  });
})();
