(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        var menuButton = document.querySelector('[data-menu-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');

        if (menuButton && mobileNav) {
            menuButton.addEventListener('click', function () {
                mobileNav.classList.toggle('open');
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var previous = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('active', slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('active', dotIndex === current);
                });
            }

            function start() {
                if (slides.length <= 1) {
                    return;
                }
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                start();
            }

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-hero-dot')) || 0);
                    restart();
                });
            });

            if (previous) {
                previous.addEventListener('click', function () {
                    show(current - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(current + 1);
                    restart();
                });
            }

            show(0);
            start();
        }

        var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
        searchInputs.forEach(function (input) {
            var scope = input.closest('main') || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-card]'));

            input.addEventListener('input', function () {
                var keyword = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-search-text') || card.textContent || '').toLowerCase();
                    card.classList.toggle('is-hidden', keyword.length > 0 && text.indexOf(keyword) === -1);
                });
            });
        });
    });
})();
