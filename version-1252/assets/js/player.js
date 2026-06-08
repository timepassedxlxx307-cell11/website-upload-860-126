(function () {
  function setupPlayer(videoSource) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    var startButtons = document.querySelectorAll("[data-player-start]");
    var volumeButton = document.querySelector("[data-player-volume]");
    var fullscreenButton = document.querySelector("[data-player-fullscreen]");
    var message = document.querySelector("[data-player-message]");
    var loaded = false;
    var hls = null;

    if (!video || !videoSource) {
      return;
    }

    function showMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }

    function loadVideo() {
      if (loaded) {
        return;
      }

      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoSource;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(videoSource);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage("视频暂时无法播放");
          }
        });
        return;
      }

      showMessage("视频暂时无法播放");
    }

    function start() {
      loadVideo();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function toggleVolume() {
      video.muted = !video.muted;
      if (volumeButton) {
        volumeButton.textContent = video.muted ? "有声" : "静音";
      }
    }

    function toggleFullscreen() {
      var target = video.closest(".player-stage") || video;
      if (document.fullscreenElement) {
        document.exitFullscreen();
        return;
      }
      if (target.requestFullscreen) {
        target.requestFullscreen();
      }
    }

    startButtons.forEach(function (button) {
      button.addEventListener("click", start);
    });

    video.addEventListener("click", start);
    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });

    if (volumeButton) {
      volumeButton.addEventListener("click", toggleVolume);
    }

    if (fullscreenButton) {
      fullscreenButton.addEventListener("click", toggleFullscreen);
    }

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.setupPlayer = setupPlayer;
})();
