<script setup lang="ts">
import { Pane, Splitpanes } from "splitpanes";
import { useMediaQuery, useWindowSize } from "@vueuse/core";

const chatToggle = ref<"twitch" | "kick">("kick");
const isMobile = useMediaQuery("(max-width: 576px)");
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
  player.currentTime = player.duration;
};

const twitchChatEmbed = `https://www.twitch.tv/embed/${SITE.platforms.twitch.user}/chat?parent=${SITE.parent}&darkpopout=true`;
const kickChatEmbed = `https://kick.com/popout/${SITE.platforms.kick.user}/chat`;
</script>

<template>
  <div class="h-dvh bg-black">
    <ClientOnly>
      <Splitpanes class="h-full" :horizontal="isMobile" :class="{ 'default-theme': !isMobile }">
        <Pane :size="isMobile ? mobileVideoSize : 80" :min-size="isMobile ? mobileVideoSize : 40">
          <div class="flex h-full items-center justify-center bg-black flex-col">
            <div class="aspect-video w-full">
              <VideoPlayer id="player" :src="SITE.hlsURL" muted autoplay @play="onPlay" />
            </div>
            <div v-if="!isMobile" class="flex justify-end w-full gap-2">
              <!-- Chat Toggler -->
              <div class="p-2 bg-neutral-900/70 text-white flex items-center justify-center gap-1">
                Chat:
                <Icon name="simple-icons:kick" />
                <USwitch :ui="{ base: 'data-[state=unchecked]:bg-lime-400' }" @click="chatToggle = chatToggle === 'twitch' ? 'kick' : 'twitch'" />
                <Icon name="simple-icons:twitch" />
              </div>
            </div>
          </div>
        </Pane>
        <Pane :size="isMobile ? mobileChatSize : 18" :min-size="isMobile ? mobileChatSize : 18">
          <iframe
            id="chat"
            allow="autoplay"
            class="w-full h-full"
            :src="chatToggle === 'twitch' ? twitchChatEmbed : kickChatEmbed"
            frameborder="0"
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-modals"
            :spellcheck="false"
          />
        </Pane>
      </Splitpanes>
    </ClientOnly>
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
