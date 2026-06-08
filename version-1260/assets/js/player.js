(function () {
    function activate(player) {
        var video = player.querySelector("video");
        var cover = player.querySelector(".play-cover");
        var url = player.dataset.videoUrl;
        if (!video || !url) {
            return;
        }
        if (player.dataset.ready !== "1") {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(url);
                hls.attachMedia(video);
                player.hls = hls;
            } else {
                video.src = url;
            }
            player.dataset.ready = "1";
        }
        if (cover) {
            cover.classList.add("hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    function bind() {
        document.querySelectorAll(".player-shell").forEach(function (player) {
            var cover = player.querySelector(".play-cover");
            var video = player.querySelector("video");
            if (cover) {
                cover.addEventListener("click", function () {
                    activate(player);
                });
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (player.dataset.ready !== "1") {
                        activate(player);
                    }
                });
            }
        });
    }

    if (document.readyState !== "loading") {
        bind();
    } else {
        document.addEventListener("DOMContentLoaded", bind);
    }
})();
