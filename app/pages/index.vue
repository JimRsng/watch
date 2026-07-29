<script setup lang="ts">
import { Pane, Splitpanes } from "splitpanes";
import { useMediaQuery } from "@vueuse/core";

const isMobile = useMediaQuery("(max-width: 976px)");
const playerRef = ref<HTMLVideoElement | null>(null);

const { $flvjs } = useNuxtApp();

let flvPlayer: ReturnType<typeof $flvjs.createPlayer> | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let isUnmounted = false;

const destroyPlayer = () => {
  if (flvPlayer) {
    flvPlayer.destroy();
    flvPlayer = null;
  }
};

const clearReconnect = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
};

const scheduleReconnect = (delay = 3000) => {
  if (isUnmounted || reconnectTimer) return;

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    startPlayer();
  }, delay);
};

const startPlayer = () => {
  if (isUnmounted || !playerRef.value) {
    scheduleReconnect();
    return;
  }

  // Evita duplicados
  destroyPlayer();

  try {
    flvPlayer = $flvjs.createPlayer(
      {
        type: "flv",
        url: SITE.flvURL,
        isLive: true
      },
      {
        enableWorker: false,
        seekType: "range",
        lazyLoad: false,
        headers: { "X-Tunnel": "true" }
      }
    );

    flvPlayer.attachMediaElement(playerRef.value);
    flvPlayer.load();

    flvPlayer.play();

    flvPlayer.on($flvjs.Events.ERROR, (error) => {
      console.info("FLV error:", error);
      destroyPlayer();
      scheduleReconnect();
    });
  }
  catch (error) {
    console.info("Error creando player:", error);
    destroyPlayer();
    scheduleReconnect();
  }
};

onMounted(() => {
  startPlayer();
});

onUnmounted(() => {
  isUnmounted = true;
  clearReconnect();
  destroyPlayer();
});
</script>

<template>
  <div class="h-screen bg-black">
    <Splitpanes class="h-full default-theme" :horizontal="isMobile">
      <Pane :size="80" :min-size="40">
        <div class="flex h-full items-center justify-center bg-black flex-col">
          <div class="aspect-video w-full">
            <video
              ref="playerRef"
              class="w-full h-full"
              controls
              autoplay
              playsinline
              muted
            />
          </div>
          <div class="p-2 bg-neutral-900/70 text-white w-full">
            <UButton :to="`https://www.twitch.tv/products/${SITE.platforms.twitch.user}`" target="_blank" label="Suscribirse" />
          </div>
        </div>
      </Pane>
      <Pane :size="18" :min-size="18">
        <iframe
          id="chat"
          allow="autoplay"
          class="aspect-video w-full h-full"
          :src="`https://www.twitch.tv/embed/${SITE.platforms.twitch.user}/chat?parent=${SITE.parent}&darkpopout=true`"
          frameborder="0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          :spellcheck="false"
        />
      </Pane>
    </Splitpanes>
  </div>
</template>

<style>
.default-theme.splitpanes--vertical>.splitpanes__splitter, .default-theme .splitpanes--vertical>.splitpanes__splitter {
  border-left: none;
}
.default-theme.splitpanes .splitpanes__splitter {
  background-color: #432c2c;
  &:hover, &:active {
    background-color: #8d5d5d;
  }
}
</style>
