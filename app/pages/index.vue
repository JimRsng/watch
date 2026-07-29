<script setup lang="ts">
import { Pane, Splitpanes } from "splitpanes";
import { useMediaQuery } from "@vueuse/core";

const isMobile = useMediaQuery("(max-width: 576px)");
const playerRef = ref<HTMLVideoElement | null>(null);

const { $flvjs } = useNuxtApp();

const flvPlayer = ref<ReturnType<typeof $flvjs.createPlayer> | null>(null);
const reconnectTimer = ref<ReturnType<typeof setTimeout> | null>(null);

const destroyPlayer = () => {
  if (flvPlayer.value) {
    flvPlayer.value.destroy();
    flvPlayer.value = null;
  }
};

const clearReconnect = () => {
  if (reconnectTimer.value) {
    clearTimeout(reconnectTimer.value);
    reconnectTimer.value = null;
  }
};

const scheduleReconnect = (delay = 3000) => {
  if (reconnectTimer.value) return;

  reconnectTimer.value = setTimeout(() => {
    reconnectTimer.value = null;
    startPlayer();
  }, delay);
};

const startPlayer = () => {
  if (!playerRef.value) {
    scheduleReconnect();
    return;
  }

  // Evita duplicados
  destroyPlayer();

  try {
    flvPlayer.value = $flvjs.createPlayer(
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

    flvPlayer.value.attachMediaElement(playerRef.value);
    flvPlayer.value.load();

    flvPlayer.value.play();

    flvPlayer.value.on($flvjs.Events.ERROR, (error) => {
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
  clearReconnect();
  destroyPlayer();
});
</script>

<template>
  <div class="h-screen bg-black">
    <ClientOnly>
      <Splitpanes class="h-full" :horizontal="isMobile" :class="{ 'default-theme': !isMobile }">
        <Pane :size="isMobile ? 35 : 80" :min-size="isMobile ? 35 : 40">
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
            <div v-if="!isMobile" class="p-2 bg-neutral-900/70 text-white w-full">
              <ButtonSubscribe />
            </div>
          </div>
        </Pane>
        <Pane :size="isMobile ? 65 : 18" :min-size="isMobile ? 65 : 18">
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
    </ClientOnly>
    <div v-if="isMobile" class="p-2 bg-neutral-950/70 text-white w-full">
      <ButtonSubscribe />
    </div>
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
