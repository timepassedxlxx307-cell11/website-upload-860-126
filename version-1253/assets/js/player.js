import { H as Hls } from './hls.js';

export function initMoviePlayer(videoUrl) {
  const video = document.querySelector('.js-player-video');
  const startButton = document.querySelector('.js-player-start');
  const message = document.querySelector('.js-player-message');
  let ready = false;
  let hlsInstance = null;

  if (!video || !startButton) {
    return;
  }

  function showMessage(text) {
    if (!message) {
      return;
    }
    message.textContent = text;
    message.hidden = false;
  }

  function prepare() {
    if (ready) {
      return;
    }
    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      return;
    }

    if (Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(videoUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal) {
          showMessage('当前影片暂时无法播放，请稍后再试');
        }
      });
      return;
    }

    showMessage('当前影片暂时无法播放，请稍后再试');
  }

  function play() {
    prepare();
    startButton.classList.add('is-hidden');
    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        startButton.classList.remove('is-hidden');
      });
    }
  }

  startButton.addEventListener('click', play);

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    startButton.classList.add('is-hidden');
  });

  video.addEventListener('pause', function () {
    if (!video.ended) {
      startButton.classList.remove('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
