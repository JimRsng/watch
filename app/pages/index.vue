<script setup lang="ts">
import { Pane, Splitpanes } from "splitpanes";
import { useElementSize, useMediaQuery, useWindowSize } from "@vueuse/core";

const chatToggle = ref<Platform>("kick");
const isMobile = useMediaQuery("(max-width: 576px)");
const firstLoad = ref(true);
const playerErrored = ref(false);

const chatFrame = useTemplateRef("chat-frame");
const { width: chatFrameWidth } = useElementSize(chatFrame);

const { width, height } = useWindowSize();

const mobileVideoSize = computed(() => {
  if (!isMobile.value) return 80;
  const videoHeight = (width.value * 9) / 16;
  const percent = (videoHeight / height.value) * 100;
  return percent;
});
const mobileChatSize = computed(() => 100 - mobileVideoSize.value);

const onPlay = () => {
  const player = document.querySelector<HTMLVideoElement>("#player video");
  if (!player) return;
  playerErrored.value = false;
  player.currentTime = player.duration;
};

const onUnmuteOverlayPointerDown = () => {
  firstLoad.value = false;
  const player = document.querySelector<HTMLVideoElement>("#player video");
  if (!player || player.error) return;
  player.muted = false;
};
</script>

<template>
  <div class="h-dvh bg-black">
    <ClientOnly>
      <Splitpanes class="h-full" :horizontal="isMobile" :class="{ 'default-theme': !isMobile }">
        <Pane :size="isMobile ? mobileVideoSize : 80" :min-size="isMobile ? mobileVideoSize : 40">
          <div class="flex h-full items-center justify-center bg-black flex-col">
            <div class="aspect-video w-full relative">
              <VideoPlayer id="player" :src="SITE.hlsURL" muted autoplay @play="onPlay" @error="playerErrored = true" />
              <div
                v-if="firstLoad && !playerErrored"
                class="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer select-none z-20"
                role="button"
                @pointerdown="onUnmuteOverlayPointerDown"
              >
                <div class="text-white text-lg flex items-center gap-2 font-semibold">
                  <Icon name="ph:speaker-simple-x-fill" size="24" />
                  <span>Click to unmute</span>
                </div>
              </div>
            </div>
            <div v-if="!isMobile" class="flex justify-end w-full gap-2 py-2 px-3">
              <ChatToggler v-model="chatToggle" class="text-white" />
            </div>
          </div>
        </Pane>
        <Pane :size="isMobile ? mobileChatSize : 18" :min-size="isMobile ? mobileChatSize : 18">
          <Splitpanes horizontal>
            <template v-if="!isMobile">
              <Pane :size="23">
                <div class="h-full">
                  <iframe
                    :src="chatToggle === 'twitch' ? embed.twitch.stream : embed.kick.stream"
                    :width="chatFrameWidth"
                    frameborder="0"
                    scrolling="no"
                    height="100%"
                    allowfullscreen
                  />
                </div>
              </Pane>
            </template>
            <Pane :size="isMobile ? 100 : mobileVideoSize">
              <div ref="chat-frame" class="relative h-full">
                <ChatFrame :src="embed.kick.chat" :class="{ hidden: chatToggle === 'twitch' }" />
                <ChatFrame :src="embed.twitch.chat" :class="{ hidden: chatToggle === 'kick' }" />
                <div v-if="isMobile" class="flex justify-start w-full gap-2 absolute z-1 top-0">
                  <ChatToggler v-model="chatToggle" class="p-2 text-white" />
                </div>
              </div>
            </Pane>
          </Splitpanes>
        </Pane>
      </Splitpanes>
    </ClientOnly>
  </div>
</template>

<style>
.default-theme.splitpanes--vertical>.splitpanes__splitter, .default-theme .splitpanes--vertical>.splitpanes__splitter,
.default-theme.splitpanes--horizontal>.splitpanes__splitter, .default-theme .splitpanes--horizontal>.splitpanes__splitter {
  border: none;
}
.default-theme.splitpanes .splitpanes__splitter {
  background-color: #414141;
  &:hover, &:active {
    background-color: #aaaaaa;
  }
}
.default-theme.splitpanes .splitpanes__pane {
  background: unset;
}
</style>
