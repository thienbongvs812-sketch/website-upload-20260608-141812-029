(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-nav]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        show(0);
        restart();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var year = scope.querySelector('[data-year-select]');
            var region = scope.querySelector('[data-region-select]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
            var empty = scope.querySelector('[data-empty-state]');

            function valueOf(element) {
                return element ? element.value.trim().toLowerCase() : '';
            }

            function apply() {
                var keyword = valueOf(input);
                var yearValue = valueOf(year);
                var regionValue = valueOf(region);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute('data-filter') || '').toLowerCase();
                    var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
                    var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
                    var keepKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var keepYear = !yearValue || cardYear === yearValue;
                    var keepRegion = !regionValue || cardRegion.indexOf(regionValue) !== -1;
                    var keep = keepKeyword && keepYear && keepRegion;
                    card.style.display = keep ? '' : 'none';
                    if (keep) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.style.display = visible ? 'none' : 'block';
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            if (year) {
                year.addEventListener('change', apply);
            }
            if (region) {
                region.addEventListener('change', apply);
            }
            apply();
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.watch-player'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var trigger = player.querySelector('.play-trigger');
            var active = false;
            var hlsInstance = null;

            function attach() {
                if (!video || active) {
                    return;
                }
                var stream = video.getAttribute('data-stream');
                if (!stream) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = stream;
                }
                active = true;
            }

            function play() {
                attach();
                if (!video) {
                    return;
                }
                player.classList.add('is-playing');
                video.controls = true;
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            }

            player.addEventListener('click', function (event) {
                if (event.target && event.target.closest && event.target.closest('a')) {
                    return;
                }
                play();
            });

            if (trigger) {
                trigger.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    play();
                });
            }

            if (video) {
                video.addEventListener('play', function () {
                    player.classList.add('is-playing');
                });
                video.addEventListener('ended', function () {
                    player.classList.remove('is-playing');
                });
            }

            window.addEventListener('pagehide', function () {
                if (hlsInstance && hlsInstance.destroy) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
