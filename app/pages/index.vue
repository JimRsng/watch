<script setup lang="ts">
import { Pane, Splitpanes } from "splitpanes";
import { useElementSize, useMediaQuery, useWindowSize } from "@vueuse/core";

const chatToggle = ref<Platform>("kick");
const isMobile = useMediaQuery("(max-width: 576px)");
const firstLoad = ref(true);
const playerErrored = ref(false);

const chatFrame = useTemplateRef("chat-frame");
const videoComp = useTemplateRef<{ $el?: HTMLElement }>("video-comp");
const player = computed(() => (videoComp.value?.$el?.querySelector<HTMLVideoElement>("video")));

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
  if (!player.value || !player.value.currentTime) return;
  playerErrored.value = false;
  player.value.currentTime = player.value.duration;
};

const onUnmuteOverlayClick = () => {
  firstLoad.value = false;
  if (!player.value || player.value.error) return;
  player.value.muted = false;
};

const isTouch = () => "ontouchstart" in window || navigator.maxTouchPoints > 0;
</script>

<template>
  <div class="h-dvh bg-black">
    <ClientOnly>
      <Splitpanes class="h-full" :horizontal="isMobile" :class="{ 'default-theme': !isMobile }">
        <Pane :size="isMobile ? mobileVideoSize : 80" :min-size="isMobile ? mobileVideoSize : 40">
          <div class="flex h-full items-center justify-center bg-black flex-col">
            <div class="group aspect-video w-full relative">
              <div
                v-if="firstLoad && !playerErrored"
                class="absolute inset-0 items-center justify-center bg-black/50 cursor-pointer select-none pointer-events-auto z-20"
                :class="isTouch() ? 'flex' : 'hidden group-hover:flex'"
                @click.stop.prevent="onUnmuteOverlayClick"
              >
                <div class="text-white text-lg flex items-center gap-2 font-semibold">
                  <Icon name="ph:speaker-simple-x-fill" size="24" />
                  <span>Click to unmute</span>
                </div>
              </div>
              <VideoPlayer id="player" ref="video-comp" :src="SITE.hlsURL" muted autoplay :class="{ 'pointer-events-none': firstLoad }" @play="onPlay" @error="playerErrored = true" />
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
