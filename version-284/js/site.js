(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');
    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;
    function showSlide(next) {
        if (!slides.length) {
            return;
        }
        current = (next + slides.length) % slides.length;
        slides.forEach(function (slide, index) {
            slide.classList.toggle('active', index === current);
        });
        dots.forEach(function (dot, index) {
            dot.classList.toggle('active', index === current);
        });
    }
    var nextButton = document.querySelector('.hero-next');
    var prevButton = document.querySelector('.hero-prev');
    if (nextButton) {
        nextButton.addEventListener('click', function () {
            showSlide(current + 1);
        });
    }
    if (prevButton) {
        prevButton.addEventListener('click', function () {
            showSlide(current - 1);
        });
    }
    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });
    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 5000);
    }

    function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function applyFilter() {
        var input = document.querySelector('.local-filter');
        var select = document.querySelector('.type-filter');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.search-card'));
        if (!input && !select) {
            return;
        }
        var q = normalize(input ? input.value : '');
        var type = normalize(select ? select.value : '');
        cards.forEach(function (card) {
            var bag = normalize([
                card.dataset.title,
                card.dataset.tags,
                card.dataset.year,
                card.dataset.type,
                card.dataset.region
            ].join(' '));
            var cardType = normalize(card.dataset.type);
            var okText = !q || bag.indexOf(q) !== -1;
            var okType = !type || cardType.indexOf(type) !== -1;
            card.classList.toggle('hidden-by-filter', !(okText && okType));
        });
    }

    var localInput = document.querySelector('.local-filter');
    var typeSelect = document.querySelector('.type-filter');
    if (localInput || typeSelect) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && localInput) {
            localInput.value = query;
        }
        if (localInput) {
            localInput.addEventListener('input', applyFilter);
        }
        if (typeSelect) {
            typeSelect.addEventListener('change', applyFilter);
        }
        applyFilter();
    }
})();

function initMoviePlayer(src) {
    var video = document.querySelector('.movie-player video');
    var overlay = document.querySelector('.player-overlay');
    if (!video || !src) {
        return;
    }
    var attached = false;
    function attach() {
        if (attached) {
            return;
        }
        attached = true;
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
        } else {
            video.src = src;
        }
    }
    function play() {
        attach();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var result = video.play();
        if (result && typeof result.catch === 'function') {
            result.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    }
    if (overlay) {
        overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });
}
