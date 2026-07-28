<script setup lang="ts">
const pause = ref(true);
const volume = ref(0);

onMounted(async () => {
  const FlvJs = (await import("flv.js")).default;
  const video = document.getElementById("player") as HTMLVideoElement;
  const playBtn = document.getElementById("playBtn") as HTMLButtonElement;
  const muteBtn = document.getElementById("muteBtn") as HTMLButtonElement;
  const volumeSlider = document.getElementById("volumeSlider") as HTMLInputElement;
  const volumeValue = document.getElementById("volumeValue") as HTMLSpanElement;

  video.volume = 0;

  const RETRY_DELAY = 3000;

  let flvPlayer: ReturnType<typeof FlvJs.createPlayer> | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let destroyed = false;
  let lastVolumeBeforeMute = Number(volumeSlider.value) / 100;

  function updateVolumeUi () {
    const volumePercent = Math.round(video.volume * 100);
    volumeSlider.value = String(volumePercent);
    volumeValue.textContent = `${volumePercent}%`;
    if (video.muted || volumePercent === 0) {
      muteBtn.textContent = "🔇";
    }
    else {
      muteBtn.textContent = "🔊";
    }
  }

  function destroyPlayer () {
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
    if (flvPlayer) {
      flvPlayer.pause();
      flvPlayer.unload();
      flvPlayer.detachMediaElement();
      flvPlayer.destroy();
      flvPlayer = null;
    }
  }

  function scheduleReconnect () {
    if (destroyed) return;
    if (retryTimer) clearTimeout(retryTimer);
    retryTimer = setTimeout(startPlayer, RETRY_DELAY);
  }

  async function startPlayer () {
    destroyPlayer();
    if (destroyed) return;

    if (!FlvJs || !FlvJs.isSupported()) {
      return;
    }

    flvPlayer = FlvJs.createPlayer(
      { type: "flv", url: SITE.flvURL, isLive: true },
      { enableWorker: false, lazyLoad: false, seekType: "range" }
    );

    flvPlayer.attachMediaElement(video);
    flvPlayer.load();

    await video.play().catch(() => {});

    flvPlayer.on(FlvJs.Events.ERROR, (errType, errDetail) => {
      console.warn("FLV error", errType, errDetail);
      scheduleReconnect();
    });
  }

  // Listeners una sola vez (no dentro de startPlayer)
  video.addEventListener("pause", () => {
    pause.value = true;
  });

  video.addEventListener("play", () => {
    pause.value = false;
  });

  video.addEventListener("stalled", scheduleReconnect);

  playBtn.addEventListener("click", () => {
    if (!flvPlayer) {
      startPlayer();
      return;
    }

    if (video.paused) {
      if (video.buffered.length > 0) {
        video.currentTime = video.buffered.end(video.buffered.length - 1) - 0.1;
      }
      video.play().catch(() => startPlayer());
    }
    else {
      video.pause();
    }
  });

  muteBtn.addEventListener("click", () => {
    if (!video.muted && video.volume > 0) {
      lastVolumeBeforeMute = video.volume;
      video.volume = 0;
      video.muted = true;
    }
    else {
      video.muted = false;
      video.volume = lastVolumeBeforeMute > 0 ? lastVolumeBeforeMute : 0.7;
    }
    updateVolumeUi();
  });

  volumeSlider.addEventListener("input", () => {
    const nextVolume = Number(volumeSlider.value) / 100;
    video.volume = nextVolume;
    video.muted = nextVolume === 0;
    if (nextVolume > 0) {
      lastVolumeBeforeMute = nextVolume;
    }
    updateVolumeUi();
  });

  window.addEventListener("beforeunload", () => {
    destroyed = true;
    destroyPlayer();
  });

  await startPlayer();
  updateVolumeUi();
});
</script>

<template>
  <div id="wrapper" class="relative w-200">
    <video id="player" autoplay muted playsinline webkit-playsinline class="w-full h-full block aspect-video" />
    <div id="controls" class="text-lg">
      <button id="playBtn" class="ctrl-btn">
        <Icon v-if="pause" name="ph:play-fill" />
        <Icon v-else name="ph:pause-fill" />
      </button>
      <button id="muteBtn" class="ctrl-btn">🔊</button>
      <label class="volume-wrap" for="volumeSlider">
        <input id="volumeSlider" type="range" min="0" max="100" :value="volume" step="1">
        <span id="volumeValue">{{ volume }}%</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        width: 100%; height: 100%;
        background: #000;
        overflow: hidden;
      }
      #player {
        width: 100%;
        height: 100%;
        display: block;
        background: #000;
      }
      #controls {
        position: absolute;
        bottom: 0; left: 0; right: 0;
        padding: 10px;
        display: flex;
        align-items: center;
        gap: 4px;
        background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 1) 50%);
        opacity: 0;
        transition: opacity 0.3s;
      }
      #wrapper:hover #controls { opacity: 1; }
      .ctrl-btn {
        background: rgba(255,255,255,0.15);
        border: none;
        color: #fff;
        padding: 4px 10px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        backdrop-filter: blur(4px);
        transition: background 0.2s;
      }
      .ctrl-btn:hover { background: rgba(255,255,255,0.3); }
      .volume-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #fff;
        font-family: system-ui, sans-serif;
        font-size: 13px;
      }
      #volumeSlider {
        width: 120px;
        accent-color: #fff;
        cursor: pointer;
      }
      #volumeValue {
        min-width: 36px;
        color: #ddd;
        text-align: right;
      }
    </style>
