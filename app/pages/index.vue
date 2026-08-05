<script setup lang="ts">
import { Pane, Splitpanes } from "splitpanes";
import { useElementSize, useMediaQuery, useWindowSize } from "@vueuse/core";

const chatToggle = ref<Platform>("kick");
const isMobile = useMediaQuery("(max-width: 576px)");
const firstLoad = ref(true);
const playerErrored = ref(false);
const ws = ref<WebSocket | null>(null);
const uuid = ref<string | null>(null);
const liveData = ref({
  isLive: false,
  sessionId: "",
  viewerCount: 0
});

const { isLive, viewerCount, sessionId } = await $fetch<{ isLive: boolean, viewerCount: number, sessionId: string }>("/live", { baseURL: SITE.hlsURL, method: "GET" }).catch(() => ({ isLive: false, viewerCount: 0, sessionId: "" }));
liveData.value.isLive = isLive;
liveData.value.viewerCount = viewerCount;
liveData.value.sessionId = sessionId;

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
                :src="`${SITE.hlsURL}/live/master.m3u8`"
                muted
                autoplay
                :class="{ 'pointer-events-none': firstLoad && !playerErrored }"
                @play="onPlay"
                @pause="onPause"
                @error="playerErrored = true"
                @fullscreen-change="onFullScreenChange"
                @buffering="onBuffering"
              />
            </div>
            <div v-if="!isMobile" class="flex justify-end w-full gap-4 py-2 px-3">
              <ChatViewerCount v-if="!playerErrored && liveData.isLive" :count="liveData.viewerCount" />
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
                  <ChatViewerCount v-if="!playerErrored && liveData.isLive" :count="liveData.viewerCount" />
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
