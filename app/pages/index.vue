<script setup lang="ts">
import { Pane, Splitpanes } from "splitpanes";
import { useMediaQuery } from "@vueuse/core";

const isMobile = useMediaQuery("(max-width: 576px)");
const playerRef = ref<HTMLMediaElement | null>(null);

const { $hls } = useNuxtApp();

// ...existing code...
const hlsPlayer = ref<InstanceType<typeof $hls> | null>(null);
const reconnectTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const tOffset = ref(0);

const destroyPlayer = () => {
  if (hlsPlayer.value) {
    hlsPlayer.value.destroy();
    hlsPlayer.value = null;
  }
};

const clearReconnect = () => {
  if (reconnectTimer.value) {
    clearTimeout(reconnectTimer.value);
    reconnectTimer.value = null;
  }
};

const scheduleReconnect = (delay = 5000) => {
  if (reconnectTimer.value) return;

  reconnectTimer.value = setTimeout(() => {
    reconnectTimer.value = null;
    startPlayer();
  }, delay);
};

const getAppendedOffset = (_eventName: string, { frag }: any) => {
  if (frag.type === "main" && frag.sn !== "initSegment" && frag.elementaryStreams.video) {
    const { start, startDTS, startPTS, maxStartPTS, elementaryStreams } = frag;
    tOffset.value = elementaryStreams.video.startPTS - start;
    hlsPlayer.value?.off?.($hls.Events.BUFFER_APPENDED, getAppendedOffset);
    console.log("video timestamp offset:", tOffset.value, { start, startDTS, startPTS, maxStartPTS, elementaryStreams });
  }
};

const startPlayer = () => {
  if (!playerRef.value) {
    scheduleReconnect();
    return;
  }

  destroyPlayer();

  try {
    hlsPlayer.value = new $hls();
    hlsPlayer.value.loadSource(SITE.hlsURL);
    hlsPlayer.value.attachMedia(playerRef.value);
    hlsPlayer.value.startLoad();
    hlsPlayer.value.on($hls.Events.BUFFER_APPENDED, getAppendedOffset);
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
  <div class="h-dvh bg-black">
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
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-modals"
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
