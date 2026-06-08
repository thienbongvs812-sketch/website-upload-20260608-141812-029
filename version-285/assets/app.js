(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-hero-dot'), 10));
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        if (slides.length > 1) {
            start();
        }
    }

    function initFilters() {
        var grid = document.querySelector('[data-filter-grid]');
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var input = document.querySelector('[data-grid-search]');
        var year = document.querySelector('[data-grid-year]');
        var type = document.querySelector('[data-grid-type]');
        var region = document.querySelector('[data-grid-region]');
        var category = document.querySelector('[data-grid-category]');
        var empty = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && input) {
            input.value = query;
        }
        function apply() {
            var term = normalize(input ? input.value : '');
            var selectedYear = normalize(year ? year.value : '');
            var selectedType = normalize(type ? type.value : '');
            var selectedRegion = normalize(region ? region.value : '');
            var selectedCategory = normalize(category ? category.value : '');
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search') + ' ' + card.getAttribute('data-title'));
                var matchTerm = !term || haystack.indexOf(term) !== -1;
                var matchYear = !selectedYear || normalize(card.getAttribute('data-year')) === selectedYear;
                var matchType = !selectedType || normalize(card.getAttribute('data-type')) === selectedType;
                var matchRegion = !selectedRegion || normalize(card.getAttribute('data-region')) === selectedRegion;
                var matchCategory = !selectedCategory || normalize(card.getAttribute('data-category')) === selectedCategory;
                var matched = matchTerm && matchYear && matchType && matchRegion && matchCategory;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }
        [input, year, type, region, category].forEach(function (control) {
            if (!control) {
                return;
            }
            control.addEventListener('input', apply);
            control.addEventListener('change', apply);
        });
        apply();
    }

    window.setupPlayer = function (mediaUrl) {
        var video = document.getElementById('movie-video');
        var button = document.getElementById('play-button');
        if (!video || !button || !mediaUrl) {
            return;
        }
        var hlsInstance = null;
        var attached = false;
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = mediaUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(mediaUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = mediaUrl;
            }
        }
        function play() {
            attach();
            button.classList.add('is-hidden');
            var request = video.play();
            if (request && typeof request.catch === 'function') {
                request.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        }
        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
        video.addEventListener('ended', function () {
            button.classList.remove('is-hidden');
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
