<script setup lang="ts">
const chatToggle = defineModel<Platform>();
defineProps<{
  isMobile: boolean;
  playerErrored: boolean;
  liveData: {
    isLive: boolean;
    sessionId: string;
    viewerCount: number;
  };
}>();
</script>

<template>
  <div class="relative w-full h-full">
    <ChatFrame :src="embed.kick.chat" :class="{ hidden: chatToggle === 'twitch' }" />
    <ChatFrame :src="embed.twitch.chat" :class="{ hidden: chatToggle === 'kick' }" />
    <div v-if="isMobile" class="flex justify-start w-full gap-2 absolute z-1 top-0 py-2.5 px-2">
      <ChatToggler v-model="chatToggle" class="text-white" />
      <ChatViewerCount v-if="!playerErrored && liveData.isLive" :count="liveData.viewerCount" />
    </div>
  </div>
</template>
