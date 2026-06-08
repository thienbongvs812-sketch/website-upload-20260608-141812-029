(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, itemIndex) {
      slide.classList.toggle('is-active', itemIndex === activeSlide);
    });

    dots.forEach(function (dot, itemIndex) {
      dot.classList.toggle('is-active', itemIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-local-filter]');
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
  var emptyNote = document.querySelector('[data-empty-note]');

  if (filterInput && filterCards.length) {
    filterInput.addEventListener('input', function () {
      var query = filterInput.value.trim().toLowerCase();
      var visible = 0;

      filterCards.forEach(function (card) {
        var matched = !query || card.getAttribute('data-search').toLowerCase().indexOf(query) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (emptyNote) {
        emptyNote.classList.toggle('is-visible', visible === 0);
      }
    });
  }
})();

function initPlayer(src) {
  var video = document.querySelector('[data-player]');
  var cover = document.querySelector('[data-player-cover]');
  var attached = false;
  var hls = null;

  if (!video) {
    return;
  }

  function attach() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      return;
    }

    video.src = src;
  }

  function play() {
    attach();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    var playTask = video.play();

    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', play);
  }

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

function renderSearchResults() {
  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-input]');
  var output = document.querySelector('[data-search-results]');
  var status = document.querySelector('[data-search-status]');

  if (!form || !input || !output || typeof searchMovies === 'undefined') {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  input.value = params.get('q') || '';

  function card(movie) {
    return [
      '<article class="movie-card">',
      '<a class="poster-wrap" href="./' + movie.file + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">',
      '</a>',
      '<div class="card-body">',
      '<div class="card-meta"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
      '<h3><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="tag-row"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function run() {
    var query = input.value.trim().toLowerCase();
    var results = searchMovies.filter(function (movie) {
      if (!query) {
        return true;
      }

      return movie.search.toLowerCase().indexOf(query) !== -1;
    }).slice(0, 120);

    output.innerHTML = results.map(card).join('');
    status.textContent = query ? '为你找到相关影视内容' : '为你展示站内精选影视内容';
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var query = input.value.trim();
    var target = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
    window.history.replaceState(null, '', target);
    run();
  });

  run();
}

document.addEventListener('DOMContentLoaded', renderSearchResults);
