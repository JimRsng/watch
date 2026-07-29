<script setup lang="ts">
import { Pane, Splitpanes } from "splitpanes";
import { useMediaQuery } from "@vueuse/core";

const isMobile = useMediaQuery("(max-width: 576px)");

const onPlay = () => {
  const player = document.querySelector<HTMLVideoElement>("#player video");
  if (!player) return;
  player.currentTime = player.duration;
};
</script>

<template>
  <div class="h-dvh bg-black">
    <ClientOnly>
      <Splitpanes class="h-full" :horizontal="isMobile" :class="{ 'default-theme': !isMobile }">
        <Pane :size="isMobile ? 35 : 80" :min-size="isMobile ? 35 : 40">
          <div class="flex h-full items-center justify-center bg-black flex-col">
            <div class="aspect-video w-full">
              <VideoPlayer id="player" :src="SITE.hlsURL" muted autoplay @play="onPlay" />
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
.default-theme.splitpanes .splitpanes__pane {
  background: unset;
}
</style>
