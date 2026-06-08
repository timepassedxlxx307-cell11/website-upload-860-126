(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function() {
        var blocks = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        blocks.forEach(function(block) {
            var video = block.querySelector("video");
            var startButton = block.querySelector("[data-start]");
            var streamUrl = video ? video.getAttribute("data-v") : "";
            var loaded = false;
            var instance = null;

            function loadStream() {
                if (!video || !streamUrl || loaded) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    instance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    instance.loadSource(streamUrl);
                    instance.attachMedia(video);
                    block._hls = instance;
                } else {
                    video.src = streamUrl;
                }
                loaded = true;
            }

            function begin() {
                loadStream();
                if (startButton) {
                    startButton.classList.add("is-hidden");
                }
                if (video) {
                    var playResult = video.play();
                    if (playResult && typeof playResult.catch === "function") {
                        playResult.catch(function() {
                            if (startButton) {
                                startButton.classList.remove("is-hidden");
                            }
                        });
                    }
                }
            }

            if (startButton) {
                startButton.addEventListener("click", begin);
            }
            if (video) {
                video.addEventListener("click", function() {
                    if (video.paused) {
                        begin();
                    }
                });
                video.addEventListener("play", function() {
                    if (startButton) {
                        startButton.classList.add("is-hidden");
                    }
                });
            }
        });
    });
})();
