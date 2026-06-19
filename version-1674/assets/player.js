(function () {
  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    const existing = document.querySelector('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
    script.async = true;
    script.dataset.hlsLoader = 'true';
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function setStatus(player, text) {
    const status = player.querySelector('[data-player-status]');
    if (status) {
      status.textContent = text || '';
    }
  }

  function playVideo(player) {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');
    const src = video && video.dataset.src;

    if (!video || !src) {
      return;
    }

    if (button) {
      button.disabled = true;
    }
    setStatus(player, '正在准备播放源…');

    function startPlayback() {
      const promise = video.play();
      player.classList.add('is-playing');
      if (promise && promise.catch) {
        promise.catch(function () {
          setStatus(player, '点击播放器控制栏继续播放。');
          if (button) {
            button.disabled = false;
          }
        });
      }
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', startPlayback, { once: true });
      video.load();
      return;
    }

    loadHls(function () {
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, startPlayback);
        hls.on(window.Hls.Events.ERROR, function (_event, data) {
          if (data && data.fatal) {
            setStatus(player, '当前线路暂时无法播放，请刷新后重试。');
            if (button) {
              button.disabled = false;
            }
          }
        });
      } else {
        video.src = src;
        video.load();
        startPlayback();
      }
    });
  }

  document.querySelectorAll('[data-static-player]').forEach(function (player) {
    const button = player.querySelector('[data-play-button]');
    if (button) {
      button.addEventListener('click', function () {
        playVideo(player);
      });
    }
  });
})();
