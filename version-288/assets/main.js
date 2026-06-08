(function () {
  function queryAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initGlobalSearch() {
    queryAll('[data-global-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        var target = './search.html';
        if (value) {
          target += '?q=' + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function initLocalSearch() {
    var input = document.querySelector('[data-search-input]');
    var list = document.querySelector('[data-search-list]');
    if (!input || !list) {
      return;
    }
    var cards = queryAll('.movie-card', list);
    var clear = document.querySelector('[data-clear-search]');

    function applyFilter() {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = ((card.getAttribute('data-terms') || '') + ' ' + (card.textContent || '')).toLowerCase();
        card.classList.toggle('is-hidden', value !== '' && text.indexOf(value) === -1);
      });
    }

    var params = new URLSearchParams(window.location.search);
    var preset = params.get('q');
    if (preset) {
      input.value = preset;
    }
    input.addEventListener('input', applyFilter);
    if (clear) {
      clear.addEventListener('click', function () {
        input.value = '';
        applyFilter();
        input.focus();
      });
    }
    applyFilter();
  }

  function initHero() {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = queryAll('[data-hero-slide]', root);
    var dots = queryAll('[data-hero-dot]', root);
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = parseInt(dot.getAttribute('data-hero-dot') || '0', 10);
        show(next);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function attachHls(video, src) {
    if (!src || video.dataset.hlsReady === '1') {
      return;
    }
    video.dataset.hlsReady = '1';
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      video._hlsInstance = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (!video.getAttribute('src')) {
      video.src = src;
    }
  }

  function initPlayers() {
    queryAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.player-start');
      if (!video) {
        return;
      }
      var src = video.getAttribute('data-src') || video.currentSrc || video.src;
      attachHls(video, src);

      function playVideo() {
        attachHls(video, src);
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', playVideo);
      }
      player.addEventListener('click', function (event) {
        if (event.target === video) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });
      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initGlobalSearch();
    initLocalSearch();
    initHero();
    initPlayers();
  });
})();
