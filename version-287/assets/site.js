(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showHero(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startHero() {
            stopHero();
            timer = window.setInterval(function () {
                showHero(current + 1);
            }, 5200);
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showHero(index);
                startHero();
            });
        });

        hero.addEventListener('mouseenter', stopHero);
        hero.addEventListener('mouseleave', startHero);
        startHero();
    }

    var globalSearch = document.querySelector('[data-global-search]');
    if (globalSearch) {
        globalSearch.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = globalSearch.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            var target = 'search.html';
            if (value) {
                target += '?q=' + encodeURIComponent(value);
            }
            window.location.href = target;
        });
    }

    var filterScopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

    filterScopes.forEach(function (scope) {
        var section = scope.parentElement || document;
        var input = scope.querySelector('.site-search-input');
        var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));
        var emptyState = scope.querySelector('.empty-state');
        var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));
        var activeValue = 'all';

        function normalized(value) {
            return String(value || '').toLowerCase().replace(/\s+/g, '');
        }

        function cardText(card) {
            return normalized([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags')
            ].join(' '));
        }

        function applyFilters() {
            var query = normalized(input ? input.value : '');
            var shown = 0;

            cards.forEach(function (card) {
                var text = cardText(card);
                var passText = !query || text.indexOf(query) !== -1;
                var passChip = activeValue === 'all' || text.indexOf(normalized(activeValue)) !== -1;
                var visible = passText && passChip;
                card.classList.toggle('is-hidden', !visible);
                if (visible) {
                    shown += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = shown !== 0;
            }
        }

        if (input) {
            input.addEventListener('input', applyFilters);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                activeValue = chip.getAttribute('data-filter-value') || 'all';
                chips.forEach(function (item) {
                    item.classList.toggle('is-active', item === chip);
                });
                applyFilters();
            });
        });

        var params = new URLSearchParams(window.location.search);
        var preset = params.get('q');
        if (preset && input) {
            input.value = preset;
        }
        applyFilters();
    });
})();
