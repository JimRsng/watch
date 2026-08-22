<script setup lang="ts">
import { useElementSize, useMediaQuery, useWindowSize } from "@vueuse/core";
import type { SplitterItem } from "@nuxt/ui";

const chatToggle = ref<Platform>("kick");
const isMobile = useMediaQuery("(max-width: 576px)");
const firstLoad = ref(true);
const playerErrored = ref(false);
const ws = ref<WebSocket | null>(null);
const uuid = ref<string | null>(null);

const { data: liveData } = await useLiveData();

const chatFrame = useTemplateRef<HTMLElement>("chat-frame");
const videoComp = useTemplateRef<{ $el?: HTMLElement }>("video-comp");
const player = computed(() => (videoComp.value?.$el?.querySelector<HTMLVideoElement>("video")));

const { width: chatFrameWidth } = useElementSize(chatFrame);
const { width, height } = useWindowSize();

const mobileVideoSize = computed(() => {
  if (!isMobile.value) return 78;
  const videoHeight = (width.value * 9) / 16;
  const percent = (videoHeight / height.value) * 100;
  return percent;
});

const mobileChatSize = computed(() => 100 - mobileVideoSize.value);

const onPlay = async () => {
  if (!player.value || !player.value.currentTime) return;
  playerErrored.value = false;
  player.value.currentTime = player.value.duration;
  uuid.value = await storage.session.get<string>(preference.uuid.key);
  if (!ws.value) {
    await createWebsocket({ ws, liveData, uuid });
  }
  if (!uuid.value || !ws.value) return;
  ws.value.send(JSON.stringify({ type: "set", uuid: uuid.value }));
};

const onPause = async () => {
  if (!player.value || !player.value.currentTime) return;
  uuid.value = await storage.session.get<string>(preference.uuid.key);
  if (!uuid.value || !ws.value) return;
  ws.value.send(JSON.stringify({ type: "delete", uuid: uuid.value }));
};

const onUnmuteOverlayClick = async () => {
  firstLoad.value = false;
  if (!player.value || player.value.error) return;
  player.value.muted = false;
  player.value.volume = await storage.local.get<number>(preference.volume.key) || preference.volume.default;
};

const isTouch = () => "ontouchstart" in window || navigator.maxTouchPoints > 0;

const onFullScreenChange = (isFullscreen: boolean) => {
  if (!isMobile.value) return;
  if (isFullscreen) screen.orientation.lock("landscape").catch(() => {});
  else screen.orientation.lock("portrait").catch(() => {});
};

const onBuffering = async () => {
  if (!ws.value) {
    await createWebsocket({ ws, liveData, uuid });
  }
};

const onError = async () => {
  playerErrored.value = true;
  if (!ws.value) {
    await createWebsocket({ ws, liveData, uuid });
  }
};

onMounted(async () => {
  await nextTick();
  player.value?.addEventListener("volumechange", () => storage.local.set(preference.volume.key, player.value?.volume ?? preference.volume.default));
  const currentSessionUUID = await storage.session.get<string>(preference.uuid.key);
  uuid.value = currentSessionUUID;
  if (!currentSessionUUID) {
    await storage.session.set(preference.uuid.key, preference.uuid.default);
    uuid.value = preference.uuid.default;
  }
  await createWebsocket({ ws, liveData, uuid });
});

const splitterCard = "items-center justify-center text-muted font-medium";
const splitterItems = computed<SplitterItem[]>(() => [
  { slot: "left", minSize: isMobile.value ? mobileVideoSize.value : 40, defaultSize: isMobile.value ? mobileVideoSize.value : 78, class: splitterCard },
  { slot: "right", minSize: isMobile.value ? mobileChatSize.value : 18, defaultSize: isMobile.value ? mobileChatSize.value : 18, class: splitterCard }
]);
const splitterNestedItems = computed<SplitterItem[]>(() => [
  { slot: "top", class: splitterCard },
  { slot: "bottom", defaultSize: isMobile.value ? 100 : mobileVideoSize.value, class: splitterCard }
]);
</script>

<template>
  <div class="h-dvh bg-black">
    <ClientOnly>
      <USplitter :items="splitterItems" :orientation="isMobile ? 'vertical' : 'horizontal'" class="overflow-hidden" :ui="{ handle: isMobile ? 'data-[orientation=vertical]:h-[0px]' : '' }">
        <template #left>
          <div class="flex w-full h-full items-center justify-center bg-black flex-col">
            <div class="group aspect-video w-full relative">
              <div
                v-if="firstLoad && !playerErrored"
                class="absolute inset-0 items-center justify-center bg-black/40 cursor-pointer select-none pointer-events-auto z-20"
                :class="isTouch() ? 'flex' : 'hidden group-hover:flex'"
                @click.stop.prevent="onUnmuteOverlayClick"
              >
                <div class="text-white text-lg flex items-center gap-2 font-semibold">
                  <Icon name="ph:speaker-simple-x-fill" size="24" />
                  <span>Click to unmute</span>
                </div>
              </div>
              <VideoPlayer
                id="player"
                ref="video-comp"
                :src="SITE.muxURL"
                muted
                autoplay
                :class="{ 'pointer-events-none': firstLoad && !playerErrored }"
                :p2p="{
                  core: {
                    announceTrackers: ['wss://tracker.openwebtorrent.com'],
                    swarmId: `jimrising-${liveData.sessionId}`,
                    simultaneousHttpDownloads: 2,
                    simultaneousP2PDownloads: 4,
                  },
                }"
                @play="onPlay"
                @pause="onPause"
                @error="onError"
                @fullscreen-change="onFullScreenChange"
                @buffering="onBuffering"
              />
            </div>
            <div v-if="!isMobile" class="flex justify-end w-full gap-4 py-2 px-3">
              <ChatViewerCount v-if="!playerErrored && liveData.viewerCount" :count="liveData.viewerCount" />
              <ChatToggler v-model="chatToggle" class="text-white" />
            </div>
          </div>
        </template>
        <template #right>
          <USplitter v-if="!isMobile" :items="splitterNestedItems" orientation="vertical" class="overflow-hidden">
            <template #top>
              <div class="w-full h-full">
                <iframe
                  :src="chatToggle === 'twitch' ? embed.twitch.stream : embed.kick.stream"
                  :width="chatFrameWidth"
                  frameborder="0"
                  scrolling="no"
                  height="100%"
                  allowfullscreen
                />
              </div>
            </template>
            <template #bottom>
              <ChatBox ref="chat-frame" v-model="chatToggle" :is-mobile="isMobile" :player-errored="playerErrored" :live-data="liveData" />
            </template>
          </USplitter>
          <template v-else>
            <ChatBox ref="chat-frame" v-model="chatToggle" :is-mobile="isMobile" :player-errored="playerErrored" :live-data="liveData" />
          </template>
        </template>
      </USplitter>
    </ClientOnly>
  </div>
</template>
