(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var shell = document.querySelector("[data-player]");
        if (!shell) {
            return;
        }

        var video = shell.querySelector("video[data-video-src]");
        var button = shell.querySelector("[data-play-button]");
        var status = shell.querySelector("[data-player-status]");
        var hls = null;
        var initialized = false;

        function setStatus(message, keepVisible) {
            if (!status) {
                return;
            }
            status.textContent = message;
            status.classList.toggle("is-hidden", !keepVisible);
        }

        function attachSource() {
            var source = video.getAttribute("data-video-src");
            if (!source) {
                setStatus("未找到播放源", true);
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus("视频已就绪", false);
                    video.play().catch(function () {
                        setStatus("请再次点击播放", true);
                    });
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        setStatus("网络错误，正在重试", true);
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        setStatus("媒体错误，正在恢复", true);
                        hls.recoverMediaError();
                    } else {
                        setStatus("无法播放视频，请刷新重试", true);
                        hls.destroy();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", function () {
                    setStatus("视频已就绪", false);
                    video.play().catch(function () {
                        setStatus("请再次点击播放", true);
                    });
                }, { once: true });
            } else {
                setStatus("当前浏览器不支持 HLS 播放", true);
            }
        }

        function startPlayback() {
            if (!video) {
                return;
            }
            if (button) {
                button.classList.add("is-hidden");
            }
            setStatus("正在加载视频", true);
            if (!initialized) {
                initialized = true;
                attachSource();
            } else {
                video.play().catch(function () {
                    setStatus("请再次点击播放", true);
                    if (button) {
                        button.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (button) {
            button.addEventListener("click", startPlayback);
        }

        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
            setStatus("正在播放", false);
        });

        video.addEventListener("pause", function () {
            if (!video.ended && button) {
                button.classList.remove("is-hidden");
            }
        });

        video.addEventListener("ended", function () {
            if (button) {
                button.classList.remove("is-hidden");
            }
            setStatus("播放结束", true);
        });

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
}());
