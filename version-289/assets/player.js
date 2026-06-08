(function () {
    function attach(video, url) {
        if (!video || !url || video.getAttribute('data-ready') === '1') {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            video.hlsInstance = hls;
        } else {
            video.src = url;
        }

        video.setAttribute('data-ready', '1');
    }

    function playFromButton(button) {
        var frame = button.closest('.player-frame');
        if (!frame) {
            return;
        }

        var video = frame.querySelector('video');
        var cover = frame.querySelector('.player-cover');
        var url = button.getAttribute('data-stream');

        attach(video, url);

        if (cover) {
            cover.classList.add('is-hidden');
        }

        if (video) {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-stream]'));

        buttons.forEach(function (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                playFromButton(button);
            });
        });

        Array.prototype.slice.call(document.querySelectorAll('.player-cover')).forEach(function (cover) {
            cover.addEventListener('click', function (event) {
                var button = cover.querySelector('[data-stream]');
                if (button && event.target !== button) {
                    button.click();
                }
            });
        });
    });
})();
