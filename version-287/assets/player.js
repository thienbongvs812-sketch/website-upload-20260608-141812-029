(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    var hlsPromise = null;

    function getHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (!hlsPromise) {
            hlsPromise = import('./hls.js').then(function (module) {
                return module.H || module.default || window.Hls || null;
            }).catch(function () {
                return null;
            });
        }
        return hlsPromise;
    }

    function initializePlayer(player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.play-overlay');
        var source = player.getAttribute('data-source');
        var attached = false;
        var hlsInstance = null;

        if (!video || !source || !button) {
            return;
        }

        function attachSource() {
            if (attached) {
                return Promise.resolve();
            }
            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.load();
                return Promise.resolve();
            }

            return getHls().then(function (Hls) {
                if (Hls && Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 60
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    return;
                }
                video.src = source;
                video.load();
            });
        }

        function startPlayback() {
            button.classList.add('is-hidden');
            player.classList.add('is-playing');
            attachSource().then(function () {
                var playResult = video.play();
                if (playResult && typeof playResult.catch === 'function') {
                    playResult.catch(function () {});
                }
            });
        }

        button.addEventListener('click', startPlayback);

        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    players.forEach(initializePlayer);
})();
